import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'about_page.dart';
import 'add_contact.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Desktop Address Book',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSwatch().copyWith(
          primary: Colors.blue,
          secondary: Colors.lightBlue,
        ),
      ),
      home: const MyHomePage(title: 'Flutter Desktop Address Book'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  List<Contact> contacts = [];
  String searchQuery = '';
  bool isLoading = false; // Flag to track loading state

  @override
  void initState() {
    super.initState();
    _fetchContacts();
  }

  _fetchContacts() async {
    setState(() {
      isLoading = true; // Set loading state to true
    });
    final response =
        await http.get(Uri.parse('http://localhost:3000/contacts'));
    if (response.statusCode == 200) {
      Iterable l = json.decode(response.body);
      contacts = List<Contact>.from(l.map((model) => Contact.fromJson(model)));
    } else {
      throw Exception('Failed to load contacts');
    }
    setState(() {
      isLoading = false; // Set loading state to false
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true, // Center the title text
        title: Text(
          widget.title,
          style: const TextStyle(
            fontSize: 20.0,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: contacts.isEmpty && !isLoading
          ? const Center(
              child: Text(
                'No contacts found.', // Display message if no contacts
              ),
            )
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextField(
                    onChanged: (value) => setState(() => searchQuery = value),
                    decoration: InputDecoration(
                      hintText: 'Search contacts',
                      prefixIcon: const Icon(Icons.search),
                      filled: true,
                      fillColor: Colors.grey[200],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10.0),
                        borderSide: const BorderSide(
                          color: Colors.transparent,
                          style: BorderStyle.none,
                        ),
                      ),
                      contentPadding: const EdgeInsets.all(15.0),
                    ),
                  ),
                ),
                Expanded(
                  child: isLoading
                      ? const Center(
                          child:
                              CircularProgressIndicator(), // Display loading indicator
                        )
                      : ListView.builder(
                          itemCount: contacts.length,
                          itemBuilder: (context, index) {
                            final contact = contacts[index];
                            if (searchQuery.isEmpty ||
                                contact.name
                                    .toLowerCase()
                                    .contains(searchQuery.toLowerCase()) ||
                                contact.email
                                    .toLowerCase()
                                    .contains(searchQuery.toLowerCase()) ||
                                contact.phone
                                    .toLowerCase()
                                    .contains(searchQuery.toLowerCase())) {
                              return ListTile(
                                title: Text(contact.name),
                                subtitle: Text(contact.email),
                                trailing: Text(contact.phone),
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          AboutPage(contactId: contact.id),
                                    ),
                                  );
                                },
                              );
                            } else {
                              return const SizedBox
                                  .shrink(); // Hide non-matching contacts
                            }
                          },
                        ),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AddContact()),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

class Contact {
  final int id;
  final String name;
  final String email;
  final String phone;

  Contact(
      {required this.id,
      required this.name,
      required this.email,
      required this.phone});

  factory Contact.fromJson(Map<String, dynamic> json) {
    return Contact(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
    );
  }
}
