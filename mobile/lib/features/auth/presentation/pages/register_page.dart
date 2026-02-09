import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/auth_bloc.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isProvider = false;

  // Password requirements
  bool _has8Chars = false;
  bool _hasUppercase = false;
  bool _hasNumber = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _checkPassword(String value) {
    setState(() {
      _has8Chars = value.length >= 8;
      _hasUppercase = value.contains(RegExp(r'[A-Z]'));
      _hasNumber = value.contains(RegExp(r'[0-9]'));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthNeedsVerification) {
            context.go('/verify-otp', extra: state.contact);
          } else if (state is AuthFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: AppTheme.errorColor),
            );
          }
        },
        builder: (context, state) {
          return SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Text('Create Account', style: Theme.of(context).textTheme.displayMedium),
                    ),
                    const SizedBox(height: 8),
                    Center(
                      child: Text('Join our sacred community', style: Theme.of(context).textTheme.bodyMedium),
                    ),
                    const SizedBox(height: 32),
                    
                    // Full Name
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Full Name',
                        prefixIcon: Icon(Icons.person_outline),
                      ),
                      textCapitalization: TextCapitalization.words,
                      validator: (v) => v?.isEmpty == true ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    
                    // Email
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    
                    // Phone
                    TextFormField(
                      controller: _phoneController,
                      decoration: const InputDecoration(
                        labelText: 'Phone',
                        prefixIcon: Icon(Icons.phone_outlined),
                        prefixText: '+91 ',
                      ),
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 16),
                    
                    // Password
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      onChanged: _checkPassword,
                      decoration: InputDecoration(
                        labelText: 'Password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                      validator: (v) {
                        if (v?.isEmpty == true) return 'Required';
                        if (!_has8Chars || !_hasUppercase || !_hasNumber) return 'Password requirements not met';
                        return null;
                      },
                    ),
                    const SizedBox(height: 8),
                    
                    // Password requirements
                    _PasswordRequirement(met: _has8Chars, text: '8+ characters'),
                    _PasswordRequirement(met: _hasUppercase, text: '1 uppercase letter'),
                    _PasswordRequirement(met: _hasNumber, text: '1 number'),
                    const SizedBox(height: 16),
                    
                    // Provider toggle
                    SwitchListTile(
                      title: const Text('I am a Service Provider'),
                      subtitle: const Text('Poojari, Astrologer, or Store'),
                      value: _isProvider,
                      onChanged: (v) => setState(() => _isProvider = v),
                      activeColor: AppTheme.primaryColor,
                      contentPadding: EdgeInsets.zero,
                    ),
                    const SizedBox(height: 24),
                    
                    // Create Account button
                    ElevatedButton(
                      onPressed: state is AuthLoading ? null : _handleRegister,
                      child: state is AuthLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Text('Create Account'),
                    ),
                    const SizedBox(height: 16),
                    
                    // Terms
                    Center(
                      child: Text.rich(
                        TextSpan(
                          text: 'By signing up, you agree to our ',
                          style: Theme.of(context).textTheme.bodySmall,
                          children: [
                            TextSpan(
                              text: 'Terms',
                              style: TextStyle(color: AppTheme.primaryColor),
                            ),
                            const TextSpan(text: ' & '),
                            TextSpan(
                              text: 'Privacy Policy',
                              style: TextStyle(color: AppTheme.primaryColor),
                            ),
                          ],
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Sign in link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('Already have an account?'),
                        TextButton(
                          onPressed: () => context.go('/login'),
                          child: const Text('Sign In'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _handleRegister() {
    if (_formKey.currentState?.validate() ?? false) {
      final email = _emailController.text.trim();
      final phone = _phoneController.text.trim();
      
      if (email.isEmpty && phone.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please provide email or phone')),
        );
        return;
      }
      
      context.read<AuthBloc>().add(RegisterRequested(
        fullName: _nameController.text.trim(),
        email: email.isNotEmpty ? email : null,
        phone: phone.isNotEmpty ? '+91$phone' : null,
        password: _passwordController.text,
        isProvider: _isProvider,
      ));
    }
  }
}

class _PasswordRequirement extends StatelessWidget {
  final bool met;
  final String text;

  const _PasswordRequirement({required this.met, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          met ? Icons.check_circle : Icons.circle_outlined,
          size: 16,
          color: met ? AppTheme.successColor : Colors.grey,
        ),
        const SizedBox(width: 8),
        Text(
          text,
          style: TextStyle(
            fontSize: 12,
            color: met ? AppTheme.successColor : Colors.grey,
          ),
        ),
      ],
    );
  }
}
