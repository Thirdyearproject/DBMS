import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class AddContact extends StatefulWidget {
  const AddContact({Key? key}) : super(key: key);

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
  final _phoneNumberController = TextEditingController();
  final _phoneTypeController = TextEditingController();
  final _emailAddressController = TextEditingController();
  final _emailTypeController = TextEditingController();
  final _organizationController = TextEditingController();
  final _jobTitleController = TextEditingController();
  final _dateOfBirthController = TextEditingController();
  final _websiteUrlController = TextEditingController();
  final _relationshipTypeController = TextEditingController();
  final _tagsController = TextEditingController();
  final _notesController = TextEditingController();

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
                    labelText: 'Name',
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
                    SizedBox(width: 16),
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
                    SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _pinCodeController,
                        decoration: const InputDecoration(
                          labelText: 'Pin Code',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter a pin code';
                          }
                          return null;
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _phoneNumberController,
                        decoration: const InputDecoration(
                          labelText: 'Phone Number',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter a phone number';
                          }
                          return null;
                        },
                      ),
                    ),
                    SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _phoneTypeController,
                        decoration: const InputDecoration(
                          labelText: 'Phone Type',
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
                        controller: _emailAddressController,
                        decoration: const InputDecoration(
                          labelText: 'Email Address',
                        ),
                      ),
                    ),
                    SizedBox(width: 16),
                    Expanded(
                      child: TextFormField(
                        controller: _emailTypeController,
                        decoration: const InputDecoration(
                          labelText: 'Email Type',
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
                    SizedBox(width: 16),
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
                      ),
                    ),
                    SizedBox(width: 16),
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
                    SizedBox(width: 16),
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
                const SizedBox(height: 16),
                TextFormField(
                  controller: _notesController,
                  decoration: const InputDecoration(
                    labelText: 'Notes',
                  ),
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

  void _submitForm() {
    // Get the values from the form
    final name = _nameController.text;
    final locality = _localityController.text;
    final city = _cityController.text;
    final state = _stateController.text;
    final pinCode = _pinCodeController.text;
    final phoneNumber = _phoneNumberController.text;
    final phoneType = _phoneTypeController.text;
    final emailAddress = _emailAddressController.text;
    final emailType = _emailTypeController.text;
    final organization = _organizationController.text;
    final jobTitle = _jobTitleController.text;
    final dateOfBirth = _dateOfBirthController.text;
    final websiteUrl = _websiteUrlController.text;
    final relationshipType = _relationshipTypeController.text;
    final tags = _tagsController.text;
    final notes = _notesController.text;

    // Create the request body
    final body = jsonEncode({
      'name': name,
      'locality': locality,
      'city': city,
      'state': state,
      'pin_code': pinCode,
      'phone_number': phoneNumber,
      'phone_type': phoneType,
      'email_address': emailAddress,
      'email_type': emailType,
      'organization': organization,
      'job_title': jobTitle,
      'date_of_birth': dateOfBirth,
      'website_url': websiteUrl,
      'relationship_type': relationshipType,
      'tags': tags,
      'notes': notes,
    });

    // Send the request
    http
        .post(
      Uri.parse('http://localhost:3000/contacts'),
      headers: {'Content-Type': 'application/json'},
      body: body,
    )
        .then((response) {
      // Check the status code
      if (response.statusCode == 201) {
        // The contact was added successfully
        Navigator.pop(context);
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
    final phoneNumber = _phoneNumberController.text;
    final phoneType = _phoneTypeController.text;
    final emailAddress = _emailAddressController.text;
    final emailType = _emailTypeController.text;
    final organization = _organizationController.text;
    final jobTitle = _jobTitleController.text;
    final dateOfBirth = _dateOfBirthController.text;
    final websiteUrl = _websiteUrlController.text;
    final relationshipType = _relationshipTypeController.text;
    final tags = _tagsController.text;
    final notes = _notesController.text;

    // Create the request body
    final body = jsonEncode({
      'name': name,
      'locality': locality,
      'city': city,
      'state': state,
      'pin_code': pinCode,
      'phone_number': phoneNumber,
      'phone_type': phoneType,
      'email_address': emailAddress,
      'email_type': emailType,
      'organization': organization,
      'job_title': jobTitle,
      'date_of_birth': dateOfBirth,
      'website_url': websiteUrl,
      'relationship_type': relationshipType,
      'tags': tags,
      'notes': notes,
    });

    // Send the request
    http
        .post(
      Uri.parse('http://localhost:3000/contacts'),
      headers: {'Content-Type': 'application/json'},
      body: body,
    )
        .then((response) {
      // Check the status code
      if (response.statusCode == 201) {
        // The contact was added successfully
        Navigator.pop(context);
        Navigator.pop(context);
      } else {
        // There was an error adding the contact
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error adding contact')),
        );
      }
    });
  }
}
