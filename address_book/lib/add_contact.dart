import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

class AddContact extends StatefulWidget {
  const AddContact({super.key});

  @override
  State<AddContact> createState() => _AddContactState();
}

class _AddContactState extends State<AddContact> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _localityController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _pinCodeController = TextEditingController();
  final _phoneNumber1Controller = TextEditingController();
  final _phoneType1Controller = TextEditingController();
  final _phoneNumber2Controller = TextEditingController();
  final _phoneType2Controller = TextEditingController();
  final _phoneNumber3Controller = TextEditingController();
  final _phoneType3Controller = TextEditingController();
  final _emailAddress1Controller = TextEditingController();
  final _emailType1Controller = TextEditingController();
  final _emailAddress2Controller = TextEditingController();
  final _emailType2Controller = TextEditingController();
  final _emailAddress3Controller = TextEditingController();
  final _emailType3Controller = TextEditingController();
  final _organizationController = TextEditingController();
  final _jobTitleController = TextEditingController();
  final _dateOfBirthController = TextEditingController();
  final _websiteUrlController = TextEditingController();
  final _relationshipTypeController = TextEditingController();
  final _tagsController = TextEditingController();
  final _notesController = TextEditingController();
  bool _viewAll = false;
  String _sharedWith = '';
  List<String> _selectedUsers = [];
  int? userId;
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    _loadUserId(); // Load userId on initialization
  }

  Future<void> _loadUserId() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      userId = prefs.getInt('userId');
      _selectedUsers.add(userId.toString());
    });
  }

  void _toggleViewAll(bool? value) {
    setState(() {
      _viewAll = value ?? false;
      if (_viewAll) {
        // Clear selected users if View All is selected
        _selectedUsers.clear();
      }
    });
  }

  //date picker
  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
        _dateOfBirthController.text =
            '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';
      });
    }
  }

  String? validatePhoneNumber(String? value) {
    if (value == null || value.isEmpty) {
      return null; // Allow empty field
    }
    if (!RegExp(r'^[0-9]{10}$').hasMatch(value)) {
      return 'Please enter a valid 10-digit phone number';
    }
    return null; // No error
  }

  String? validatePhoneNumber1(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter a valid 10-digit phone number'; // Allow empty field
    }
    if (!RegExp(r'^[0-9]{10}$').hasMatch(value)) {
      return 'Please enter a valid 10-digit phone number';
    }
    return null; // No error
  }

  String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return null;
    }
    if (!RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        .hasMatch(value)) {
      return 'Please enter a valid email address';
    }
    return null; // No error
  }

  @override
  Widget build(BuildContext context) {
    final keyboardPadding = MediaQuery.of(context).viewInsets.bottom;
    final bottomPadding = keyboardPadding > 0 ? 16.0 : 80.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Contact'),
        centerTitle: true,
        backgroundColor: Colors.blue,
        elevation: 0,
      ),
      body: Padding(
        padding: EdgeInsets.fromLTRB(16.0, 16.0, 16.0, bottomPadding),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    filled: true,
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a name';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _localityController,
                        decoration: const InputDecoration(
                          labelText: 'Locality',
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _cityController,
                        decoration: const InputDecoration(
                          labelText: 'City',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _stateController,
                        decoration: const InputDecoration(
                          labelText: 'State',
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _pinCodeController,
                        decoration: const InputDecoration(
                          labelText: 'Pin Code',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _phoneNumber1Controller,
                        decoration: const InputDecoration(
                          labelText: 'Phone Number 1',
                        ),
                        validator: validatePhoneNumber1,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _phoneType1Controller,
                        decoration: const InputDecoration(
                          labelText: 'Phone1 Type',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _phoneNumber2Controller,
                        decoration: const InputDecoration(
                          labelText: 'Phone Number 2',
                        ),
                        validator: validatePhoneNumber,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _phoneType2Controller,
                        decoration: const InputDecoration(
                          labelText: 'Phone2 Type',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _phoneNumber3Controller,
                        decoration: const InputDecoration(
                          labelText: 'Phone Number 3',
                        ),
                        validator: validatePhoneNumber,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _phoneType3Controller,
                        decoration: const InputDecoration(
                          labelText: 'Phone3 Type',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _emailAddress1Controller,
                        decoration: const InputDecoration(
                          labelText: 'Email Address1',
                        ),
                        validator: validateEmail,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _emailType1Controller,
                        decoration: const InputDecoration(
                          labelText: 'Email1 Type',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _emailAddress2Controller,
                        decoration: const InputDecoration(
                          labelText: 'Email Address2',
                        ),
                        validator: validateEmail,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _emailType2Controller,
                        decoration: const InputDecoration(
                          labelText: 'Email2 Type',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _emailAddress3Controller,
                        decoration: const InputDecoration(
                          labelText: 'Email Address3',
                        ),
                        validator: validateEmail,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _emailType3Controller,
                        decoration: const InputDecoration(
                          labelText: 'Email3 Type',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _organizationController,
                        decoration: const InputDecoration(
                          labelText: 'Organization',
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _jobTitleController,
                        decoration: const InputDecoration(
                          labelText: 'Job Title',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _dateOfBirthController,
                        decoration: const InputDecoration(
                          labelText: 'Date of Birth',
                        ),
                        onTap: () {
                          _selectDate(context);
                        },
                        readOnly: true,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _websiteUrlController,
                        decoration: const InputDecoration(
                          labelText: 'Website URL',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _relationshipTypeController,
                        decoration: const InputDecoration(
                          labelText: 'Relationship Type',
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _tagsController,
                        decoration: const InputDecoration(
                          labelText: 'Tags',
                        ),
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _notesController,
                        decoration: const InputDecoration(
                          labelText: 'Notes',
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: InkWell(
                        onTap: () {
                          _showShareDialog(context);
                        },
                        child: InputDecorator(
                          decoration: const InputDecoration(
                            labelText: 'Share with',
                          ),
                          child: Text(_sharedWith.isNotEmpty
                              ? _sharedWith
                              : 'Select users'),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Checkbox(
                      value: _viewAll,
                      onChanged: _toggleViewAll,
                    ),
                    Text('View All'),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          _submitForm();
                        }
                      },
                      child: const Text('Add Another Contact'),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          _submitFormAndReturnHome();
                        }
                      },
                      child: const Text('Add Contact and Return Home'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showShareDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Share with'),
          content: StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  FutureBuilder<List<Map<String, dynamic>>>(
                    future: _fetchUsers(),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return CircularProgressIndicator();
                      } else if (snapshot.hasError) {
                        return Text('Error: ${snapshot.error}');
                      } else {
                        return Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Add a checkbox for "Select All" if needed
                            ...snapshot.data!.map((user) => CheckboxListTile(
                                  title: Text(user['name']),
                                  value: _selectedUsers.contains(user['id']),
                                  onChanged: (bool? selected) {
                                    setState(() {
                                      if (selected!) {
                                        _selectedUsers.add(user['id']);
                                      } else {
                                        _selectedUsers.remove(user['id']);
                                      }
                                    });
                                  },
                                )),
                          ],
                        );
                      }
                    },
                  ),
                ],
              );
            },
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

  Future<List<Map<String, dynamic>>> _fetchUsers() async {
    try {
      final response = await http.get(Uri.parse('http://localhost:3000/users'));

      if (response.statusCode == 200) {
        final List<dynamic> userData = json.decode(response.body);

        List<Map<String, dynamic>> users = userData.map((user) {
          return {
            'id': user['userid'].toString(), // Convert user ID to string
            'name': user['username'],
          };
        }).toList();

        return users;
      } else {
        throw Exception('Failed to load users');
      }
    } catch (error) {
      print('Error fetching users: $error');
      throw Exception('Failed to load users');
    }
  }

  void _submitForm() {
    // Get the values from the form
    final name = _nameController.text;
    final locality = _localityController.text;
    final city = _cityController.text;
    final state = _stateController.text;
    final pinCode = _pinCodeController.text;
    final phoneNumber1 = _phoneNumber1Controller.text;
    final phoneType1 = _phoneType1Controller.text;
    final phoneNumber2 = _phoneNumber2Controller.text;
    final phoneType2 = _phoneType2Controller.text;
    final phoneNumber3 = _phoneNumber3Controller.text;
    final phoneType3 = _phoneType3Controller.text;
    final emailAddress1 = _emailAddress1Controller.text;
    final emailType1 = _emailType1Controller.text;
    final emailAddress2 = _emailAddress2Controller.text;
    final emailType2 = _emailType2Controller.text;
    final emailAddress3 = _emailAddress3Controller.text;
    final emailType3 = _emailType3Controller.text;
    final organization = _organizationController.text;
    final jobTitle = _jobTitleController.text;
    final dateOfBirth =
        _selectedDate != null ? _dateOfBirthController.text : null;
    final websiteUrl = _websiteUrlController.text;
    final relationshipType = _relationshipTypeController.text;
    final tags = _tagsController.text;
    final notes = _notesController.text;
    final viewAll = _viewAll;
    final shareUserIds = _selectedUsers.join(',');

    // Create the request body
    final body = jsonEncode({
      'name': name,
      'locality': locality,
      'city': city,
      'state': state,
      'pin_code': pinCode,
      'userid': userId,
      'phone_number1': phoneNumber1,
      'phone_type1': phoneType1,
      'phone_number2': phoneNumber2,
      'phone_type2': phoneType2,
      'phone_number3': phoneNumber3,
      'phone_type3': phoneType3,
      'email_address1': emailAddress1,
      'email_type1': emailType1,
      'email_address2': emailAddress2,
      'email_type2': emailType2,
      'email_address3': emailAddress3,
      'email_type3': emailType3,
      'organization': organization,
      'job_title': jobTitle,
      'date_of_birth': dateOfBirth,
      'website_url': websiteUrl,
      'relationship_type': relationshipType,
      'tags': tags,
      'notes': notes,
      'visible_to_all': viewAll,
      'share_userid': shareUserIds
    });

    // Send the request
    http
        .post(Uri.parse('http://localhost:3000/contacts'),
            headers: {'Content-Type': 'application/json'}, body: body)
        .then((response) {
      // Check the status code
      if (response.statusCode == 201) {
        const SnackBar(content: Text('The contact was added successfully'));
        // The contact was added successfully
        Navigator.pushReplacementNamed(context, '/add-contact');
      } else {
        // There was an error adding the contact
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error adding contact')),
        );
      }
    });
  }

  void _submitFormAndReturnHome() {
    // Get the values from the form
    final name = _nameController.text;
    final locality = _localityController.text;
    final city = _cityController.text;
    final state = _stateController.text;
    final pinCode = _pinCodeController.text;
    final phoneNumber1 = _phoneNumber1Controller.text;
    final phoneType1 = _phoneType1Controller.text;
    final phoneNumber2 = _phoneNumber2Controller.text;
    final phoneType2 = _phoneType2Controller.text;
    final phoneNumber3 = _phoneNumber3Controller.text;
    final phoneType3 = _phoneType3Controller.text;
    final emailAddress1 = _emailAddress1Controller.text;
    final emailType1 = _emailType1Controller.text;
    final emailAddress2 = _emailAddress2Controller.text;
    final emailType2 = _emailType2Controller.text;
    final emailAddress3 = _emailAddress3Controller.text;
    final emailType3 = _emailType3Controller.text;
    final organization = _organizationController.text;
    final jobTitle = _jobTitleController.text;
    final dateOfBirth =
        _selectedDate != null ? _dateOfBirthController.text : null;
    final websiteUrl = _websiteUrlController.text;
    final relationshipType = _relationshipTypeController.text;
    final tags = _tagsController.text;
    final notes = _notesController.text;
    final viewAll = _viewAll;
    //String sharedWith = _sharedWith;
    final shareUserIds = _selectedUsers.join(',');

    // Create the request body
    final body = jsonEncode({
      'name': name,
      'locality': locality,
      'city': city,
      'state': state,
      'pin_code': pinCode,
      'userid': userId,
      'phone_number1': phoneNumber1,
      'phone_type1': phoneType1,
      'phone_number2': phoneNumber2,
      'phone_type2': phoneType2,
      'phone_number3': phoneNumber3,
      'phone_type3': phoneType3,
      'email_address1': emailAddress1,
      'email_type1': emailType1,
      'email_address2': emailAddress2,
      'email_type2': emailType2,
      'email_address3': emailAddress3,
      'email_type3': emailType3,
      'organization': organization,
      'job_title': jobTitle,
      'date_of_birth': dateOfBirth,
      'website_url': websiteUrl,
      'relationship_type': relationshipType,
      'tags': tags,
      'notes': notes,
      'visible_to_all': viewAll,
      'share_userid': shareUserIds,
    });

    // Send the request
    http
        .post(Uri.parse('http://localhost:3000/contacts'),
            headers: {'Content-Type': 'application/json'}, body: body)
        .then((response) {
      // Check the status code
      if (response.statusCode == 201) {
        const SnackBar(content: Text('The contact was added successfully'));
        // The contact was added successfully
        Navigator.pop(context, true);
      } else {
        // There was an error adding the contact
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error adding contact')),
        );
      }
    }).catchError((error) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error adding contact')),
      );
    });
  }
}
