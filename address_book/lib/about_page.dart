import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class AboutPage extends StatelessWidget {
  final int contactId;

  const AboutPage({super.key, required this.contactId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('About'),
        centerTitle: true,
        backgroundColor: Colors.blue,
        elevation: 0,
      ),
      body: FutureBuilder(
        future: _fetchAbout(contactId),
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            var data = snapshot.data as Map<String, dynamic>;
            return ListView(
              children: [
                ListTile(
                  title: Text(data['name']),
                  subtitle: Text(data['email']),
                  trailing: Text(data['phone']),
                ),
                ListTile(
                  title: Text('Company: ${data['company']}'),
                  subtitle: Text('Job Title: ${data['jobTitle']}'),
                ),
                ListTile(
                  title: Text('Address: ${data['address']}'),
                  subtitle: Text('City: ${data['city']}'),
                ),
              ],
            );
          } else if (snapshot.hasError) {
            return Text('Error: ${snapshot.error}');
          }

          // By default, show a loading spinner.
          return const CircularProgressIndicator();
        },
      ),
    );
  }

  Future<Map<String, dynamic>> _fetchAbout(int contactId) async {
    final response = await http
        .get(Uri.parse('http://localhost:3000/contacts/$contactId/about'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load about information');
    }
  }
}
