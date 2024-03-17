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

  @override
  void initState() {
    super.initState();
    _fetchContacts();
  }

  _fetchContacts() async {
    final response =
        await http.get(Uri.parse('http://localhost:3000/contacts'));
    if (response.statusCode == 200) {
      Iterable l = json.decode(response.body);
      contacts = List<Contact>.from(l.map((model) => Contact.fromJson(model)));
      setState(() {});
    } else {
      throw Exception('Failed to load contacts');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        centerTitle: true,
        backgroundColor: Colors.blue,
        elevation: 0,
      ),
      body: ListView.builder(
        itemCount: contacts.length,
        itemBuilder: (context, index) {
          return ListTile(
            title: Text(contacts[index].name),
            subtitle: Text(contacts[index].email),
            trailing: Text(contacts[index].phone),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      AboutPage(contactId: contacts[index].id),
                ),
              );
            },
          );
        },
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
  Contact({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
  });

  factory Contact.fromJson(Map<String, dynamic> json) {
    return Contact(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
    );
  }
}
