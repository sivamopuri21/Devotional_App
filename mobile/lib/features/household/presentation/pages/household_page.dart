import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';

class HouseholdPage extends StatelessWidget {
  const HouseholdPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('My Household'),
        actions: [
          IconButton(icon: const Icon(Icons.edit), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Household Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: AppTheme.goldColor.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.home, color: AppTheme.goldColor, size: 28),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Sharma Family',
                                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                              ),
                              Text(
                                '4 members',
                                style: TextStyle(color: Colors.grey.shade600),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Divider(),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            '123 Temple Street, Hyderabad, Telangana - 500001',
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            // Members Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Members', style: Theme.of(context).textTheme.displaySmall),
                TextButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.person_add_outlined, size: 18),
                  label: const Text('Invite'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            
            // Members List
            _MemberTile(name: 'Ramesh Sharma', role: 'Head', isHead: true),
            _MemberTile(name: 'Sunita Sharma', role: 'Adult'),
            _MemberTile(name: 'Priya Sharma', role: 'Adult'),
            _MemberTile(name: 'Arjun Sharma', role: 'Child'),
            
            const SizedBox(height: 24),
            
            // Pending Invites
            Text('Pending Invites', style: Theme.of(context).textTheme.displaySmall),
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.orange.shade100,
                  child: const Icon(Icons.mail_outline, color: Colors.orange),
                ),
                title: const Text('+91 98765 43210'),
                subtitle: const Text('Invited as Adult'),
                trailing: IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () {},
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            // Actions
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.swap_horiz),
              label: const Text('Transfer Head Role'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.exit_to_app, color: AppTheme.errorColor),
              label: const Text('Leave Household', style: TextStyle(color: AppTheme.errorColor)),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                side: const BorderSide(color: AppTheme.errorColor),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MemberTile extends StatelessWidget {
  final String name;
  final String role;
  final bool isHead;

  const _MemberTile({required this.name, required this.role, this.isHead = false});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppTheme.lightSurface,
          child: Icon(
            Icons.person,
            color: isHead ? AppTheme.goldColor : AppTheme.primaryColor,
          ),
        ),
        title: Row(
          children: [
            Text(name),
            if (isHead) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.goldColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'HEAD',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.goldColor),
                ),
              ),
            ],
          ],
        ),
        subtitle: Text(role),
        trailing: !isHead
            ? PopupMenuButton(
                itemBuilder: (context) => [
                  const PopupMenuItem(value: 'role', child: Text('Change Role')),
                  const PopupMenuItem(value: 'remove', child: Text('Remove')),
                ],
              )
            : null,
      ),
    );
  }
}
