#!/bin/bash

# Test file upload functionality via API
echo "🔧 Testing File Upload API"
echo "=========================="
echo ""

# Create test files
echo "Creating test files..."
echo "Test assessment content" > test-assessment.txt
echo "Test grade sheet content" > test-grade-sheet.txt

# Get a test referral number (you'll need to replace this with an actual one)
REFERRAL_NUMBER="REF-202410-1234"  # Replace with actual referral number

echo "Using referral number: $REFERRAL_NUMBER"
echo ""

# Test the API endpoint with files
echo "Testing file upload via API..."
echo ""

# Create form data
curl -X POST http://localhost:3000/api/referrals/student-data \
  -F "referral_number=$REFERRAL_NUMBER" \
  -F "student_first_name=Test" \
  -F "student_last_name=Student" \
  -F "student_id=123456789" \
  -F "date_of_birth=2010-01-01" \
  -F "gender=male" \
  -F "assessment_file=@test-assessment.txt" \
  -F "grade_sheet=@test-grade-sheet.txt" \
  -F "grade=10" \
  -F "can_handle_program=true" \
  -F "military_service_potential=true" \
  -F "personal_opinion=Test submission with files"

echo ""
echo ""
echo "Test complete! Check Salesforce for uploaded files."
echo ""

# Cleanup
rm -f test-assessment.txt test-grade-sheet.txt