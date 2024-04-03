import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

// Import the UpdateContact page if not already imported
import 'update_contact.dart';

class AboutContact extends StatefulWidget {
  final int contactId;

  const AboutContact({super.key, required this.contactId});

  @override
  _AboutContactState createState() => _AboutContactState();
}

class _AboutContactState extends State<AboutContact> {
  Map<String, dynamic>? contactData;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchContactData();
  }

  Future<void> _fetchContactData() async {
    setState(() {
      isLoading = true;
    });

    try {
      final response = await http.get(
        Uri.parse('http://localhost:3000/contacts/${widget.contactId}'),
        // Replace 'your_api_endpoint' with the actual endpoint
      );

      if (response.statusCode == 200) {
        setState(() {
          contactData = json.decode(response.body);
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load contact data');
      }
    } catch (e) {
      print('Error: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('About ${contactData?['name'] ?? 'Contact'}'),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : contactData != null
              ? SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildContactDetail(
                            'Name', contactData?['name'] ?? 'N/A'),
                        _buildRowWithTwoFields('Phone Numbers', [
                          contactData?['phone_number1'],
                          contactData?['phone_number2'],
                          contactData?['phone_number3']
                        ], [
                          contactData?['phone_type1'],
                          contactData?['phone_type2'],
                          contactData?['phone_type3']
                        ]),
                        _buildRowWithTwoFields('Emails', [
                          contactData?['email_address1'],
                          contactData?['email_address2'],
                          contactData?['email_address3']
                        ], [
                          contactData?['email_type1'],
                          contactData?['email_type2'],
                          contactData?['email_type3']
                        ]),
                        _buildContactDetail('Organization',
                            contactData?['organization'] ?? 'N/A'),
                        _buildContactDetail(
                            'Job Title', contactData?['job_title'] ?? 'N/A'),
                        _buildContactDetail('Date of Birth',
                            _formatDate(contactData?['date_of_birth'])),
                        _buildContactDetail(
                            'Website', contactData?['website_url'] ?? 'N/A'),
                        _buildContactDetail(
                            'Notes', contactData?['notes'] ?? 'N/A'),
                        _buildContactDetail('Address',
                            '${contactData?['locality'] ?? 'N/A'}, ${contactData?['city'] ?? 'N/A'}, ${contactData?['state'] ?? 'N/A'}, ${contactData?['pin_code'] ?? 'N/A'}'),
                      ],
                    ),
                  ),
                )
              : const Center(child: Text('No contact data available')),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => UpdateContact(contactId: widget.contactId),
            ),
          );
        },
        child: const Icon(Icons.edit),
      ),
    );
  }

  Widget _buildContactDetail(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 18.0,
              fontWeight: FontWeight.bold,
              color: Colors.blue, // Adjust color as needed
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16.0,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRowWithTwoFields(
      String label, List<String?> values, List<String?> types) {
    List<Widget> rows = [];
    for (int i = 0; i < values.length; i++) {
      if (values[i] != null) {
        rows.add(
          Row(
            children: [
              Expanded(
                flex: 2,
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 18.0,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue,
                  ),
                ),
              ),
              Expanded(
                flex: 3,
                child: Text(
                  '${values[i]} (${types[i] ?? 'N/A'})',
                  style: const TextStyle(
                    fontSize: 16.0,
                  ),
                ),
              ),
            ],
          ),
        );
      }
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: rows,
    );
  }

  String _formatDate(String? dateTimeString) {
    if (dateTimeString != null) {
      DateTime dateTime = DateTime.parse(dateTimeString);
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }
    return 'N/A';
  }
}
