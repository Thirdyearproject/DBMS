import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class PreferredShare extends StatefulWidget {
  const PreferredShare({Key? key}) : super(key: key);

  @override
  State<PreferredShare> createState() => _PreferredShareState();
}

class _PreferredShareState extends State<PreferredShare> {
  List<User> _users = [];
  List<User> _selectedUsers = [];
  int? userId;

  @override
  void initState() {
    super.initState();
    _loadUserIdAndFetchData(); // Load user ID and fetch data
  }

  Future<void> _loadUserIdAndFetchData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userId = prefs.getInt('userId');
    });
    await Future.wait(
        [_fetchUsers(), _fetchSelectedUsers()]); // Fetch concurrently
  }

  Future<List<User>> _fetchUsers() async {
    try {
      final response = await http.get(Uri.parse('http://localhost:3000/users'));
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => User.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load users: ${response.statusCode}');
      }
    } catch (error) {
      print('Error fetching users: $error');
      return []; // Return an empty list on error
    }
  }

  Future<void> _fetchSelectedUsers() async {
    if (userId == null) return;
    try {
      final response =
          await http.get(Uri.parse('http://localhost:3000/UserShares/$userId'));
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _selectedUsers = data.map((id) {
            final user = _users.firstWhere((user) => user.id == id,
                orElse: () => User(
                    id: -1, username: 'Unknown')); // Handle if ID not found
            return user;
          }).toList();

          // Add current user to selected users if not already present
          if (!_selectedUsers.any((user) => user.id == userId)) {
            _selectedUsers.add(User(id: userId!, username: ''));
          }
        });
      } else {
        throw Exception(
            'Failed to load selected users: ${response.statusCode}');
      }
    } catch (error) {
      print('Error fetching selected users: $error');
    }
  }

  Future<void> _toggleUserSelection(User user, bool selected) async {
    if (userId == null) {
      return; // User ID not available, do not proceed
    }
    setState(() {
      if (selected) {
        _selectedUsers.add(user);
      } else {
        _selectedUsers.remove(user);
      }
    });
  }

  Future<void> _submitSelections() async {
    if (userId == null) return;
    final selectedUserIds = _selectedUsers.map((user) => user.id).toList();
    final requestData = {
      'user': userId,
      'selected_users': selectedUserIds,
    };
    final response = await http.put(
      Uri.parse(
          'https://localhost:3000/userShares'), // Assuming endpoint for submitting data
      body: jsonEncode(requestData),
      headers: {'Content-Type': 'application/json'},
    );
    if (response.statusCode == 200) {
      // Handle success, e.g., show success message
      print('Selections submitted successfully');
    } else {
      // Handle error
      print('Error submitting selections');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Preferred Share Settings"),
        actions: [
          IconButton(
            onPressed: _submitSelections,
            icon: Icon(Icons.save),
          )
        ],
      ),
      body: FutureBuilder<List<User>>(
        future: _fetchUsers(), // Use _fetchUsers() directly as the future
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(child: Text('No users found.'));
          } else {
            _users = snapshot.data!; // Update _users with fetched data
            return ListView.builder(
              itemCount: _users.length,
              itemBuilder: (context, index) {
                final user = _users[index];
                final bool isSelected = _selectedUsers
                    .any((selectedUser) => selectedUser.id == user.id);
                return CheckboxListTile(
                  title:
                      Text(user.username ?? 'Unknown'), // Handle null usernames
                  value: isSelected,
                  onChanged: (selected) {
                    _toggleUserSelection(user, selected!);
                  },
                );
              },
            );
          }
        },
      ),
    );
  }
}

class User {
  final int id;
  final String? username; // Allow username to be null

  User({required this.id, this.username});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      username: json['username'] as String?, // Handle null usernames
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
    };
  }
}
