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
  String selectedFilterOption =
      'Filter Option 1'; // Initially selected filter option
  bool isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchContacts();
  }

  Future<void> _fetchContacts() async {
    setState(() {
      isLoading = true;
    });
    final response =
        await http.get(Uri.parse('http://localhost:3000/contacts'));
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

  _deleteContact(int id) async {
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
        actions: [
          // Filter button with only the icon
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              showFilterOptions(context);
            },
          ),
        ],
      ),
      body: Container(
        child: contacts.isEmpty && !isLoading
            ? const Center(
                child: Text(
                  'No contacts found.',
                ),
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
                        // Filter button with only the icon
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
          SizedBox(height: 16), // Adjust spacing between buttons as needed
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

  // Function to show dropdown menu for filter options
  void showFilterOptions(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Select Filter Option'),
          content: DropdownButton<String>(
            value: selectedFilterOption,
            onChanged: (String? newValue) {
              setState(() {
                selectedFilterOption = newValue!;
              });
              // Apply filter logic here based on selectedFilterOption
              // For example:
              // if (selectedFilterOption == 'Filter Option 1') {
              //   // Apply filter logic for option 1
              // } else if (selectedFilterOption == 'Filter Option 2') {
              //   // Apply filter logic for option 2
              // } else if (selectedFilterOption == 'Filter Option 3') {
              //   // Apply filter logic for option 3
              // }
              Navigator.of(context).pop();
            },
            items: <String>[
              'Filter Option 1',
              'Filter Option 2',
              'Filter Option 3'
            ].map<DropdownMenuItem<String>>((String value) {
              return DropdownMenuItem<String>(
                value: value,
                child: Text(value),
              );
            }).toList(),
          ),
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
