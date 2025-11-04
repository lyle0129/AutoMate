import React from 'react';
import { useForm } from '../../hooks';
import { validators } from './Form';
import FormField from './FormField';
import FormSection, { FormGroup } from './FormSection';
import Button from '../ui/Button';

/**
 * Example form demonstrating the usage of form components
 * This can be used as a reference for creating other forms
 */
const ExampleForm = ({ onSubmit, onCancel }) => {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps
  } = useForm(
    // Initial values
    {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      bio: ''
    },
    // Validation rules
    {
      firstName: [validators.required('First name is required')],
      lastName: [validators.required('Last name is required')],
      email: [
        validators.required('Email is required'),
        validators.email()
      ],
      password: [
        validators.required('Password is required'),
        validators.minLength(8, 'Password must be at least 8 characters')
      ],
      confirmPassword: [
        validators.required('Please confirm your password'),
        validators.match('password', 'Passwords do not match')
      ],
      role: [validators.required('Please select a role')]
    }
  );

  const roleOptions = [
    { value: '', label: 'Select a role' },
    { value: 'admin', label: 'Administrator' },
    { value: 'mechanic', label: 'Mechanic' },
    { value: 'customer', label: 'Customer' }
  ];

  const submitForm = handleSubmit(async (formData) => {
    await onSubmit(formData);
  });

  return (
    <form onSubmit={submitForm} className="space-y-6">
      <FormSection 
        title="Personal Information"
        description="Enter your basic personal details"
      >
        <FormGroup columns={2}>
          <FormField
            {...getFieldProps('firstName')}
            label="First Name"
            type="text"
            placeholder="Enter your first name"
            required
          />
          
          <FormField
            {...getFieldProps('lastName')}
            label="Last Name"
            type="text"
            placeholder="Enter your last name"
            required
          />
        </FormGroup>

        <FormField
          {...getFieldProps('email')}
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          required
        />
      </FormSection>

      <FormSection 
        title="Account Settings"
        description="Set up your account credentials and role"
      >
        <FormGroup columns={2}>
          <FormField
            {...getFieldProps('password')}
            label="Password"
            type="password"
            placeholder="Enter a secure password"
            required
          />
          
          <FormField
            {...getFieldProps('confirmPassword')}
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            required
          />
        </FormGroup>

        <FormField
          {...getFieldProps('role')}
          label="Role"
          type="select"
          options={roleOptions}
          required
        />
      </FormSection>

      <FormSection 
        title="Additional Information"
        description="Optional information about yourself"
        collapsible
        defaultExpanded={false}
      >
        <FormField
          {...getFieldProps('bio')}
          label="Bio"
          type="textarea"
          placeholder="Tell us about yourself (optional)"
        />
      </FormSection>

      <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        
        <Button
          type="submit"
          loading={isSubmitting}
        >
          Create Account
        </Button>
      </div>
    </form>
  );
};

export default ExampleForm;