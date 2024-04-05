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
    _fetchUsers();
    _fetchSelectedUsers();
    _loadUserId();
  }

  Future<void> _loadUserId() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userId = prefs.getInt('userId');
    });
  }

  Future<void> _fetchUsers() async {
    final response = await http.get(Uri.parse('https://localhost:3000/users'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      setState(() {
        _users = data.map((json) => User.fromJson(json)).toList();
      });
    } else {
      throw Exception('Failed to load users');
    }
  }

  Future<void> _fetchSelectedUsers() async {
    final response =
        await http.get(Uri.parse('https://localhost:3000/selectedUsers'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      setState(() {
        _selectedUsers = data.map((json) => User.fromJson(json)).toList();
      });
    } else {
      throw Exception('Failed to load selected users');
    }
  }

  Future<void> _toggleUserSelection(User user, bool selected) async {
    if (userId == null) {
      return; // User ID not available, do not proceed
    }

    final Map<String, dynamic> requestData = {
      'logedin_user': userId,
      'id': user.id,
      'username': user.username,
    };

    if (selected) {
      // Add user to selected users
      final response = await http.put(
        Uri.parse('https://localhost:3000/selectedUsers/${user.id}'),
        body: jsonEncode(requestData),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode == 200) {
        setState(() {
          _selectedUsers.add(user);
        });
      }
    } else {
      // Remove user from selected users
      final response = await http.delete(
        Uri.parse('https://localhost:3000/selectedUsers/${user.id}'),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode == 200) {
        setState(() {
          _selectedUsers.remove(user);
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Preferred Share Settings"),
      ),
      body: ListView.builder(
        itemCount: _users.length,
        itemBuilder: (context, index) {
          final user = _users[index];
          final bool isSelected =
              _selectedUsers.any((selectedUser) => selectedUser.id == user.id);
          return CheckboxListTile(
            title: Text(user.username),
            value: isSelected,
            onChanged: (selected) {
              _toggleUserSelection(user, selected!);
            },
          );
        },
      ),
    );
  }
}

class User {
  final int id;
  final String username;

  User({
    required this.id,
    required this.username,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      username: json['username'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
    };
  }
}
