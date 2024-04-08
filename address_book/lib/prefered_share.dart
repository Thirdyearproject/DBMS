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
  bool _isSubmitting = false; // Add a flag to track submission status

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

    setState(() {
      _isSubmitting = true; // Set flag to true before making the request
    });

    final requestData = {
      'current_user_id': userId,
      'shared_user_ids': _selectedUserIds,
    };
    print('JSON being sent: $requestData');

    try {
      final response = await http.put(
        Uri.parse('http://localhost:3000/userShares'),
        body: jsonEncode(requestData),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        // Handle success
        print('Selections submitted successfully');
        // You might want to navigate to another screen or show a success message
      } else {
        // Handle error
        print('Error submitting selections');
        // You might want to show an error message
      }
    } catch (error) {
      print('Error during PUT request: $error');
      // Handle potential network or other errors
    } finally {
      setState(() {
        _isSubmitting = false; // Reset flag regardless of success or failure
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Preferred Share Settings"),
        actions: [
          IconButton(
            onPressed: _isSubmitting
                ? null
                : _submitSelections, // Disable button during submission
            icon: _isSubmitting
                ? CircularProgressIndicator(
                    // Show progress indicator while submitting
                    color: Colors.white,
                  )
                : Icon(Icons.save),
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
