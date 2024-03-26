import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class AboutContact extends StatefulWidget {
  final int contactId;

  const AboutContact({Key? key, required this.contactId}) : super(key: key);

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
          ? Center(child: CircularProgressIndicator())
          : contactData != null
              ? Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Name: ${contactData?['name'] ?? 'N/A'}',
                        style: TextStyle(fontSize: 18.0),
                      ),
                      SizedBox(height: 10.0),
                      if (contactData?['phone_number1'] != null)
                        Text(
                          'Phone Number 1: ${contactData?['phone_number1'] ?? 'N/A'}',
                          style: TextStyle(fontSize: 18.0),
                        ),
                      if (contactData?['phone_type1'] != null)
                        Text(
                          'Phone Type 1: ${contactData?['phone_type1'] ?? 'N/A'}',
                          style: TextStyle(fontSize: 18.0),
                        ),
                      if (contactData?['phone_number2'] != null)
                        Text(
                          'Phone Number 2: ${contactData?['phone_number2'] ?? 'N/A'}',
                          style: TextStyle(fontSize: 18.0),
                        ),
                      if (contactData?['phone_type2'] != null)
                        Text(
                          'Phone Type 2: ${contactData?['phone_type2'] ?? 'N/A'}',
                          style: TextStyle(fontSize: 18.0),
                        ),
                      if (contactData?['phone_number3'] != null)
                        Text(
                          'Phone Number 3: ${contactData?['phone_number3'] ?? 'N/A'}',
                          style: TextStyle(fontSize: 18.0),
                        ),
                      if (contactData?['phone_type3'] != null)
                        Text(
                          'Phone Type 3: ${contactData?['phone_type3'] ?? 'N/A'}',
                          style: TextStyle(fontSize: 18.0),
                        ),
                      SizedBox(height: 10.0),
                      if (contactData?['email_address1'] != null)
                        Text(
                          'Email 1: ${contactData?['email_address1'] ?? 'N/A'}',
                          style: TextStyle(fontSize: 18.0),
                        ),
                      if (contactData?['email_type1'] != null)
                        Text(
                          'Email Type 1: ${contactData?['email_type1'] ?? 'N/A'}',
                          style: TextStyle(fontSize: 18.0),
                        ),
                      if (contactData?['email_address2'] != null)
                        Text(
                          'Email 2: ${contactData?['email_address2'] ?? 'N/A'}',
                          style: TextStyle(fontSize: 18.0),
                        ),
                      if (contactData?['email_type2'] != null)
                        Text(
                          'Email Type 2: ${contactData?['email_type2'] ?? 'N/A'}',
                          style: TextStyle(fontSize: 18.0),
                        ),
                      if (contactData?['email_address3'] != null)
                        Text(
                          'Email 3: ${contactData?['email_address3'] ?? 'N/A'}',
                          style: TextStyle(fontSize: 18.0),
                        ),
                      if (contactData?['email_type3'] != null)
                        Text(
                          'Email Type 3: ${contactData?['email_type3'] ?? 'N/A'}',
                          style: TextStyle(fontSize: 18.0),
                        ),
                      SizedBox(height: 10.0),
                      Text(
                        'Organization: ${contactData?['organization'] ?? 'N/A'}',
                        style: TextStyle(fontSize: 18.0),
                      ),
                      SizedBox(height: 10.0),
                      Text(
                        'Job Title: ${contactData?['job_title'] ?? 'N/A'}',
                        style: TextStyle(fontSize: 18.0),
                      ),
                      SizedBox(height: 10.0),
                      Text(
                        'Date of Birth: ${_formatDate(contactData?['date_of_birth'])}',
                        style: TextStyle(fontSize: 18.0),
                      ),
                      SizedBox(height: 10.0),
                      Text(
                        'Website: ${contactData?['website_url'] ?? 'N/A'}',
                        style: TextStyle(fontSize: 18.0),
                      ),
                      SizedBox(height: 10.0),
                      Text(
                        'Notes: ${contactData?['notes'] ?? 'N/A'}',
                        style: TextStyle(fontSize: 18.0),
                      ),
                      SizedBox(height: 10.0),
                      Text(
                        'Address: ${contactData?['locality'] ?? 'N/A'}, ${contactData?['city'] ?? 'N/A'}, ${contactData?['state'] ?? 'N/A'}, ${contactData?['pin_code'] ?? 'N/A'}',
                        style: TextStyle(fontSize: 18.0),
                      ),
                    ],
                  ),
                )
              : Center(child: Text('No contact data available')),
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
