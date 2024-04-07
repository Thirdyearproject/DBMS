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
  List<int> _selectedUserIds = [];
  int? userId;

  @override
  void initState() {
    super.initState();
    _loadUserIdAndFetchData(); // Load user ID and fetch data
  }

  Future<void> _loadUserIdAndFetchData() async {
    final prefs = await SharedPreferences.getInstance();
    final storedUserId = prefs.getInt('userId');

    if (storedUserId != null) {
      setState(() {
        userId = storedUserId;
      });
      await _fetchUsers(); // Fetch users
    } else {
      print('User ID not found in SharedPreferences.');
      // Handle the case where the user ID is not found, e.g., show an error message
    }
  }

  Future<void> _fetchUsers() async {
    try {
      final response = await http.get(Uri.parse('http://localhost:3000/users'));
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        setState(() {
          _users = data.map((json) => User.fromJson(json)).toList();
        });
      } else {
        throw Exception('Failed to load users: ${response.statusCode}');
      }
    } catch (error) {
      print('Error fetching users: $error');
    }
  }

  Future<void> _submitSelections() async {
    if (userId == null) return;
    final requestData = {
      'current_user_id': userId,
      'share_user_id': _selectedUserIds,
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
      body: ListView.builder(
        itemCount: _users.length,
        itemBuilder: (context, index) {
          final user = _users[index];
          final bool isSelected = _selectedUserIds.contains(user.userId);
          return CheckboxListTile(
            title: Text(user.username.isNotEmpty ? user.username : 'Unknown'),
            value: isSelected,
            onChanged: (selected) {
              setState(() {
                if (selected!) {
                  _selectedUserIds.add(user.userId);
                } else {
                  _selectedUserIds.remove(user.userId);
                }
              });
            },
          );
        },
      ),
    );
  }
}

class User {
  final int userId;
  final String username;

  User({required this.userId, required this.username});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['userid'] as int,
      username: json['username'] as String,
    );
  }
}
