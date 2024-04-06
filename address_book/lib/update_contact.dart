import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class UpdateContact extends StatefulWidget {
  final int contactId;

  const UpdateContact({super.key, required this.contactId});

  @override
  State<UpdateContact> createState() => _UpdateContactPageState();
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

class _UpdateContactPageState extends State<UpdateContact> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _localityController;
  late TextEditingController _cityController;
  late TextEditingController _stateController;
  late TextEditingController _pinCodeController;
  late TextEditingController _phoneNumber1Controller;
  late TextEditingController _phoneType1Controller;
  late TextEditingController _phoneNumber2Controller;
  late TextEditingController _phoneType2Controller;
  late TextEditingController _phoneNumber3Controller;
  late TextEditingController _phoneType3Controller;
  late TextEditingController _emailAddress1Controller;
  late TextEditingController _emailType1Controller;
  late TextEditingController _emailAddress2Controller;
  late TextEditingController _emailType2Controller;
  late TextEditingController _emailAddress3Controller;
  late TextEditingController _emailType3Controller;
  late TextEditingController _organizationController;
  late TextEditingController _jobTitleController;
  late TextEditingController _dateOfBirthController;
  late TextEditingController _websiteUrlController;
  late TextEditingController _relationshipTypeController;
  late TextEditingController _tagsController;
  late TextEditingController _notesController;
  bool _viewAll = false;
  String _sharedWith = '';
  List<String> _selectedUsers = [];
  int? userId;
  DateTime? _selectedDate;
  //late String _initialContactName; // To store initially fetched name

  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchInitialContactDetails();
    _nameController = TextEditingController();
    _localityController = TextEditingController();
    _cityController = TextEditingController();
    _stateController = TextEditingController();
    _pinCodeController = TextEditingController();
    _phoneNumber1Controller = TextEditingController();
    _phoneType1Controller = TextEditingController();
    _phoneNumber2Controller = TextEditingController();
    _phoneType2Controller = TextEditingController();
    _phoneNumber3Controller = TextEditingController();
    _phoneType3Controller = TextEditingController();
    _emailAddress1Controller = TextEditingController();
    _emailType1Controller = TextEditingController();
    _emailAddress2Controller = TextEditingController();
    _emailType2Controller = TextEditingController();
    _emailAddress3Controller = TextEditingController();
    _emailType3Controller = TextEditingController();
    _organizationController = TextEditingController();
    _jobTitleController = TextEditingController();
    _dateOfBirthController = TextEditingController();
    _websiteUrlController = TextEditingController();
    _relationshipTypeController = TextEditingController();
    _tagsController = TextEditingController();
    _notesController = TextEditingController();
    _loadUserId();
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

  Future<void> _fetchInitialContactDetails() async {
    // Replace with your actual REST API endpoint for fetching contact details
    final String url = 'http://localhost:3000/contacts/${widget.contactId}';
    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        _nameController.text = data['name'] ?? '';
        _localityController.text = data['locality'] ?? '';
        _cityController.text = data['city'] ?? '';
        _stateController.text = data['state'] ?? '';
        _pinCodeController.text = data['pin_code'] ?? '';
        _phoneNumber1Controller.text = data['phone_number1'] ?? '';
        _phoneType1Controller.text = data['phone_type1'] ?? '';
        _phoneNumber2Controller.text = data['phone_number2'] ?? '';
        _phoneType2Controller.text = data['phone_type2'] ?? '';
        _phoneNumber3Controller.text = data['phone_number3'] ?? '';
        _phoneType3Controller.text = data['phone_type3'] ?? '';
        _emailAddress1Controller.text = data['email_address1'] ?? '';
        _emailType1Controller.text = data['email_type1'] ?? '';
        _emailAddress2Controller.text = data['email_address2'] ?? '';
        _emailType2Controller.text = data['email_type2'] ?? '';
        _emailAddress3Controller.text = data['email_address3'] ?? '';
        _emailType3Controller.text = data['email_type3'] ?? '';
        _organizationController.text = data['organization'] ?? '';
        _jobTitleController.text = data['job_title'] ?? '';
        _dateOfBirthController.text = data['date_of_birth'] ?? '';
        _websiteUrlController.text = data['website_url'] ?? '';
        _relationshipTypeController.text =
            data['relationship_type'] ?? ''; // Corrected key name
        _tagsController.text = data['tags'] ?? '';
        _notesController.text = data['notes'] ?? '';
      } else {
        // Handle error (e.g., display error message to user)
        //print('Error fetching contact details: ${response.statusCode}');
      }
    } catch (error) {
      // Handle network or other errors
      //print('Error fetching contact details2: $error');
    }
  }

  Future<void> _updateContact() async {
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
      'user': userId,
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
    setState(() => isLoading = true);
    try {
      // Replace with your actual REST API endpoint for updating contact
      final String url = 'http://localhost:3000/contacts/${widget.contactId}';
      final response = await http.put(Uri.parse(url),
          headers: {'Content-Type': 'application/json'}, body: body);
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
      body: SingleChildScrollView(
        child: Form(
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
                          validator: validatePhoneNumber1),
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
                        // controller: _relationshipTypeController,
                        decoration: const InputDecoration(
                          labelText: 'Relationship Type',
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        // controller: _tagsController,
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
                      //const SizedBox(height: 16),
                      child: TextFormField(
                        // controller: _notesController,
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
}
