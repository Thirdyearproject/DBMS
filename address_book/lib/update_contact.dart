import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class UpdateContact extends StatefulWidget {
  final int contactId;

  const UpdateContact({Key? key, required this.contactId}) : super(key: key);

  @override
  State<UpdateContact> createState() => _UpdateContactPageState();
}

class _UpdateContactPageState extends State<UpdateContact> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late String _initialContactName; // To store initially fetched name

  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchInitialContactDetails();
    _nameController = TextEditingController();
  }

  Future<void> _fetchInitialContactDetails() async {
    // Replace with your actual REST API endpoint for fetching contact details
    final String url = 'http://your-api-endpoint/contacts/${widget.contactId}';
    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        _initialContactName = data['name'];
        _nameController.text = _initialContactName;
      } else {
        // Handle error (e.g., display error message to user)
        print('Error fetching contact details: ${response.statusCode}');
      }
    } catch (error) {
      // Handle network or other errors
      print('Error fetching contact details: $error');
    }
  }

  Future<void> _updateContact() async {
    setState(() => isLoading = true);
    try {
      // Replace with your actual REST API endpoint for updating contact
      final String url =
          'http://your-api-endpoint/contacts/${widget.contactId}';
      final response = await http.put(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'name': _nameController.text}),
      );
      if (response.statusCode == 200) {
        // Success! Navigate back, potentially with a success message
        Navigator.pop(context, 'Contact updated successfully!');
      } else {
        // Handle error (e.g., display error message to user)
        print('Error updating contact: ${response.statusCode}');
      }
    } catch (error) {
      // Handle network or other errors
      print('Error updating contact: $error');
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Update Contact'),
      ),
      body: Form(
        key: _formKey,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Contact Name',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: isLoading ? null : _updateContact,
                child: isLoading
                    ? const CircularProgressIndicator(
                        color: Colors.white,
                      )
                    : const Text('Update Contact'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
