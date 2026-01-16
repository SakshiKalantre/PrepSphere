const axios = require('axios');

async function testAPIs() {
    console.log('Testing Admin Analytics API...');
    
    try {
        const analyticsResponse = await axios.get('http://127.0.0.1:8000/api/v1/admin/analytics');
        console.log('Analytics Status:', analyticsResponse.status);
        console.log('Analytics Data:');
        console.log(JSON.stringify(analyticsResponse.data, null, 2));
        
        // Check required fields
        const requiredFields = ['placedStudents', 'unplacedStudents', 'activeUsers', 'inactiveUsers'];
        console.log('\nRequired Fields Check:');
        requiredFields.forEach(field => {
            if (analyticsResponse.data.hasOwnProperty(field)) {
                console.log(`✓ ${field}: ${analyticsResponse.data[field]}`);
            } else {
                console.log(`✗ ${field}: MISSING`);
            }
        });
        
    } catch (error) {
        console.error('Analytics API Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('Testing Admin Users API...');
    
    try {
        const usersResponse = await axios.get('http://127.0.0.1:8000/api/v1/admin/users');
        console.log('Users Status:', usersResponse.status);
        console.log(`Total Users: ${usersResponse.data.length}`);
        
        // Check for students with offer letters
        const studentsWithOffers = usersResponse.data.filter(u => 
            (u.role === 'Student' || u.role === 'STUDENT') && u.has_verified_offer_letter
        );
        console.log(`Students with offer letters: ${studentsWithOffers.length}`);
        
        if (studentsWithOffers.length > 0) {
            console.log('Sample students with offer letters:');
            studentsWithOffers.slice(0, 3).forEach(student => {
                console.log(`  - ${student.name}: has_verified_offer_letter = ${student.has_verified_offer_letter}`);
            });
        }
        
    } catch (error) {
        console.error('Users API Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testAPIs();