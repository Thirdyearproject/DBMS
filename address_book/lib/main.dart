import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'add_contact.dart';
import 'update_contact.dart';
import 'about_contact.dart';

void main() async {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

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
      routes: {
        '/add-contact': (context) => const AddContact(),
      },
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key, required this.title}) : super(key: key);

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  List<Contact> contacts = [];
  String searchQuery = '';
  bool isLoading = false;

  // Filter fields
  String cityFilter = '';
  String dateOfBirthStartFilter = '';
  String dateOfBirthEndFilter = '';
  String organizationFilter = '';
  String jobFilter = '';
  String relationFilter = '';

  // Text editing controllers
  TextEditingController dateOfBirthStartFilterController =
      TextEditingController();
  TextEditingController dateOfBirthEndFilterController =
      TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchContacts();
  }

  Future<void> _fetchContacts() async {
    setState(() {
      isLoading = true;
    });

    final queryParams = {
      'searchQuery': searchQuery,
      'city': cityFilter,
      'dateOfBirthStart': dateOfBirthStartFilter,
      'dateOfBirthEnd': dateOfBirthEndFilter,
      'organization': organizationFilter,
      'job': jobFilter,
      'relation': relationFilter,
    };

    final uri = Uri.http('localhost:3000', '/filter', queryParams);

    final response = await http.get(uri);
    if (response.statusCode == 200) {
      Iterable l = json.decode(response.body);
      contacts = List<Contact>.from(
          l.map((model) => Contact.fromJson(model)).toList());
    } else {
      throw Exception('Failed to load contacts');
    }

    setState(() {
      isLoading = false;
    });
  }

  Future<void> _deleteContact(int id) async {
    final response =
        await http.delete(Uri.parse('http://localhost:3000/contacts/$id'));
    if (response.statusCode == 200) {
      _fetchContacts();
    } else {
      throw Exception('Failed to delete contact');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        title: Text(
          widget.title,
          style: const TextStyle(
            fontSize: 20.0,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Container(
        child: contacts.isEmpty && !isLoading
            ? const Center(
                child: Text('No contacts found.'),
              )
            : Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            onChanged: (value) => setState(
                                () => searchQuery = value.toLowerCase()),
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
                        SizedBox(width: 10),
                        IconButton(
                          icon: const Icon(Icons.filter_list),
                          onPressed: () {
                            showFilterOptions(context);
                          },
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: isLoading
                        ? const Center(
                            child: CircularProgressIndicator(),
                          )
                        : ListView.builder(
                            itemCount: contacts.length,
                            itemBuilder: (context, index) {
                              Contact contact = contacts[index];
                              if (contact.name
                                  .toLowerCase()
                                  .contains(searchQuery.toLowerCase())) {
                                return GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => AboutContact(
                                          contactId: contact.id,
                                        ),
                                      ),
                                    );
                                  },
                                  child: MouseRegion(
                                    onHover: (event) => setState(
                                        () => contact.isHovered = true),
                                    onExit: (event) => setState(
                                        () => contact.isHovered = false),
                                    child: Card(
                                      child: ListTile(
                                        leading: const CircleAvatar(
                                          child: Icon(Icons.person),
                                        ),
                                        title: Text(
                                          contact.name,
                                          textAlign: contact.isHovered
                                              ? TextAlign.left
                                              : TextAlign.center,
                                        ),
                                        trailing: contact.isHovered
                                            ? Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  IconButton(
                                                    onPressed: () async {
                                                      await Navigator.push(
                                                        context,
                                                        MaterialPageRoute(
                                                          builder: (context) =>
                                                              UpdateContact(
                                                            contactId:
                                                                contact.id,
                                                          ),
                                                        ),
                                                      );
                                                      _fetchContacts();
                                                    },
                                                    icon:
                                                        const Icon(Icons.edit),
                                                  ),
                                                  IconButton(
                                                    onPressed: () =>
                                                        _deleteContact(
                                                            contact.id),
                                                    icon: const Icon(
                                                        Icons.delete),
                                                  ),
                                                ],
                                              )
                                            : null,
                                      ),
                                    ),
                                  ),
                                );
                              } else {
                                return const SizedBox.shrink();
                              }
                            },
                          ),
                  ),
                ],
              ),
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          FloatingActionButton(
            onPressed: () async {
              await Navigator.pushNamed(context, '/add-contact');
              _fetchContacts();
            },
            tooltip: 'Add Contact',
            child: const Icon(Icons.add),
          ),
          SizedBox(height: 16),
          FloatingActionButton(
            onPressed: () {
              _fetchContacts();
            },
            tooltip: 'Refresh',
            child: const Icon(Icons.refresh),
          ),
        ],
      ),
    );
  }

  void showFilterOptions(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Filter Contacts'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                decoration: InputDecoration(
                  hintText: 'City',
                ),
                onChanged: (value) {
                  setState(() {
                    cityFilter = value;
                  });
                },
              ),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: dateOfBirthStartFilterController,
                      decoration: InputDecoration(
                        hintText: 'Start Date (yyyy-mm-dd)',
                      ),
                      onTap: () async {
                        DateTime? pickedDate = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(1900),
                          lastDate: DateTime(2100),
                        );
                        if (pickedDate != null) {
                          setState(() {
                            dateOfBirthStartFilter =
                                "${pickedDate.year}-${pickedDate.month.toString().padLeft(2, '0')}-${pickedDate.day.toString().padLeft(2, '0')}";
                            dateOfBirthStartFilterController.text =
                                dateOfBirthStartFilter;
                          });
                        }
                      },
                    ),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: dateOfBirthEndFilterController,
                      decoration: InputDecoration(
                        hintText: 'End Date (yyyy-mm-dd)',
                      ),
                      onTap: () async {
                        DateTime? pickedDate = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(1900),
                          lastDate: DateTime(2100),
                        );
                        if (pickedDate != null) {
                          setState(() {
                            dateOfBirthEndFilter =
                                "${pickedDate.year}-${pickedDate.month.toString().padLeft(2, '0')}-${pickedDate.day.toString().padLeft(2, '0')}";
                            dateOfBirthEndFilterController.text =
                                dateOfBirthEndFilter;
                          });
                        }
                      },
                    ),
                  ),
                ],
              ),
              TextField(
                decoration: InputDecoration(
                  hintText: 'Organization',
                ),
                onChanged: (value) {
                  setState(() {
                    organizationFilter = value;
                  });
                },
              ),
              TextField(
                decoration: InputDecoration(
                  hintText: 'Job',
                ),
                onChanged: (value) {
                  setState(() {
                    jobFilter = value;
                  });
                },
              ),
              TextField(
                decoration: InputDecoration(
                  hintText: 'Relation',
                ),
                onChanged: (value) {
                  setState(() {
                    relationFilter = value;
                  });
                },
              ),
            ],
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                _fetchContacts();
                Navigator.of(context).pop();
              },
              child: Text('Apply'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text('Cancel'),
            ),
          ],
        );
      },
    );
  }
}

class Contact {
  final int id;
  final String name;
  bool isHovered = false;

  Contact({required this.id, required this.name});

  factory Contact.fromJson(Map<String, dynamic> json) {
    return Contact(
      id: json['contact_id'],
      name: json['name'],
    );
  }
}
