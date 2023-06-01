const request = require('supertest');
const app = require('./app');
const { User } = require('./models');
let token;

// If not already created you must run npm start to create the database schema tables

describe('Test API Endpoints', () => {
    // POST /setup
    test('Populate the database', async () => {
        const response = await request(app).post('/setup');
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('message', 'Database populated successfully.');
    });


    // POST /signup
    test('Register new user', async () => {
        const userData = {
            fullName: 'John Doe',
            username: 'testUser',
            password: 'testPassword',
            email: 'test@example.com'
        };
        const response = await request(app).post('/signup').send(userData);
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('message', 'User registered successfully.');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('fullName', userData.fullName);
        expect(response.body.user).toHaveProperty('username', userData.username);
        expect(response.body.user).toHaveProperty('email', userData.email);
    }); 


    // POST /login
    test('login with the user created in the /setup', async () => {
        const loginData = {
            username: 'Admin',
            password: 'P@ssword2023'
        };
        const response = await request(app).post('/login').send(loginData);
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('message', 'User logged in successfully.');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('fullName', 'Admin User');
        expect(response.body.user).toHaveProperty('username', loginData.username);
        expect(response.body.user).toHaveProperty('email', 'admin@user.com');
        expect(response.body).toHaveProperty('token');
        token = response.body.token;
    });


    // POST /category
    test('Create a new category', async () => {
        const categoryData = {
            name: 'CAT_TEST'
        };
        const response = await request(app)
            .post('/category')
            .set('Authorization', `Bearer ${token}`)
            .send(categoryData);
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('name', 'CAT_TEST');
    }); 


    // POST /item
    test('Create a new item with CAT_ITEM category', async () => {
        const itemData = {
            name: 'ITEM_TEST',
            price: 10,
            sku: 'TEST123',
            stock_quantity: 100,
            categoryId: 9
        };
        const response = await request(app)
        .post('/item')
        .set('Authorization', `Bearer ${token}`)
        .send(itemData);
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('name', 'ITEM_TEST');
    }); 


    // POST /search (mart)
    test('Search for items with "mart" in the item name', async () => {
        const searchQuery = 'mart';
        const response = await request(app)
        .post('/search')
        .send({ searchQuery })
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('items');
        expect(response.body.items).toHaveLength(3);
    });


    // POST /search (Laptop)
    test('Search for items with "Laptop" in the item name', async () => {
        const searchQuery = 'Laptop';
        const response = await request(app)
        .post('/search')
        .send({ searchQuery })
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('items');
        expect(response.body.items).toHaveLength(1);
    });


    // Test Admin user endpoints
    test('Test Admin user endpoints', async () => {
        // Update category
        const updateCategoryData = {
            name: 'Updated Category',
        };
        const updateCategoryResponse = await request(app)
            .put('/category/1')
            .set('Authorization', `Bearer ${token}`)
            .send(updateCategoryData);
        expect(updateCategoryResponse.status).toEqual(200);
        expect(updateCategoryResponse.body).toHaveProperty('name', 'Updated Category');
        // Update item
        const updateItemData = {
            name: 'Updated Item',
            price: 5,
            stock_quantity: 7,
            sku: 'UPD123',
            categoryId: 6
        };
        const updateItemResponse = await request(app)
            .put('/item/130')
            .set('Authorization', `Bearer ${token}`)
            .send(updateItemData);
        expect(updateItemResponse.status).toEqual(200);
        expect(updateItemResponse.body).toHaveProperty('name', 'Updated Item');
        // Delete item
        const deleteItemResponse = await request(app)
            .delete('/item/131')
            .set('Authorization', `Bearer ${token}`);
        expect(deleteItemResponse.status).toEqual(200);
        expect(deleteItemResponse.body).toHaveProperty('message', 'Item deleted successfully.');
    });


    // Delete added data from previus tests
    test('Delete added data', async () => {
        // Delete item
        const deleteItemResponse = await request(app)
            .delete('/item/161')
            .set('Authorization', `Bearer ${token}`);
        expect(deleteItemResponse.status).toEqual(200);
        expect(deleteItemResponse.body).toHaveProperty('message', 'Item deleted successfully.');
        // Delete category
        const deleteCategoryResponse = await request(app)
            .delete('/category/9')
            .set('Authorization', `Bearer ${token}`);
        expect(deleteCategoryResponse.status).toEqual(200);
        expect(deleteCategoryResponse.body).toHaveProperty('message', 'Category deleted');
        // Delete the registered user
        const registeredUser = await User.findOne({ where: { username: 'testUser' } });
        if (registeredUser) {
            await registeredUser.destroy();
            console.log('Registered user deleted successfully.');
        } else {
            console.log('Registered user not found.');
        }
    });


    // POST /setup
    test('Return error if database is already populated', async () => {
        const response = await request(app).post('/setup');
        expect(response.status).toEqual(400);
        expect(response.body).toHaveProperty('message', 'Database already populated.');
    });
}); 