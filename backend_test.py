#!/usr/bin/env python3
"""
Comprehensive E-commerce API Testing Suite
Tests all backend endpoints for customer and seller functionality
"""

import requests
import json
import sys
from datetime import datetime

class EcommerceAPITester:
    def __init__(self, base_url="https://local-ecommerce-4.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.customer_token = None
        self.seller_token = None
        self.test_product_id = None
        self.test_order_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        self.log(f"Testing {name} - {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - Status: {response.status_code}", "PASS")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log(f"❌ FAILED - Expected {expected_status}, got {response.status_code}", "FAIL")
                try:
                    self.log(f"Response: {response.text}", "ERROR")
                except:
                    pass
                return False, {}

        except Exception as e:
            self.log(f"❌ FAILED - Error: {str(e)}", "ERROR")
            return False, {}

    # Authentication Tests
    def test_customer_register(self):
        """Test customer registration"""
        test_email = f"customer_{datetime.now().strftime('%H%M%S')}@test.com"
        data = {
            "email": test_email,
            "password": "password123",
            "name": "Test Customer",
            "role": "customer"
        }
        success, response = self.run_test("Customer Registration", "POST", "auth/register", 200, data)
        if success and 'access_token' in response:
            self.customer_token = response['access_token']
            self.log(f"Customer token obtained: {self.customer_token[:10]}...", "SUCCESS")
            return True
        return False

    def test_seller_register(self):
        """Test seller registration"""
        test_email = f"seller_{datetime.now().strftime('%H%M%S')}@test.com"
        data = {
            "email": test_email,
            "password": "password123",
            "name": "Test Seller",
            "role": "seller"
        }
        success, response = self.run_test("Seller Registration", "POST", "auth/register", 200, data)
        if success and 'access_token' in response:
            self.seller_token = response['access_token']
            self.log(f"Seller token obtained: {self.seller_token[:10]}...", "SUCCESS")
            return True
        return False

    def test_auth_me_customer(self):
        """Test getting current customer user info"""
        return self.run_test("Get Customer Info", "GET", "auth/me", 200, token=self.customer_token)[0]

    def test_auth_me_seller(self):
        """Test getting current seller user info"""
        return self.run_test("Get Seller Info", "GET", "auth/me", 200, token=self.seller_token)[0]

    # Product Tests
    def test_get_all_products(self):
        """Test getting all products"""
        return self.run_test("Get All Products", "GET", "products", 200)[0]

    def test_get_products_by_category(self):
        """Test getting products by category"""
        return self.run_test("Get Electronics Products", "GET", "products", 200, params={"category": "Electronics"})[0]

    def test_seller_create_product(self):
        """Test seller creating a product"""
        data = {
            "name": "Test Product",
            "description": "This is a test product for API testing",
            "price": 29.99,
            "category": "Electronics",
            "stock": 10,
            "image_url": "https://example.com/test-product.jpg"
        }
        success, response = self.run_test("Create Product", "POST", "seller/products", 200, data, self.seller_token)
        if success and 'id' in response:
            self.test_product_id = response['id']
            self.log(f"Test product created: {self.test_product_id}", "SUCCESS")
            return True
        return False

    def test_get_seller_products(self):
        """Test getting seller's products"""
        return self.run_test("Get Seller Products", "GET", "seller/products", 200, token=self.seller_token)[0]

    def test_get_single_product(self):
        """Test getting a single product by ID"""
        if not self.test_product_id:
            self.log("No test product ID available", "SKIP")
            return True
        return self.run_test("Get Single Product", "GET", f"products/{self.test_product_id}", 200)[0]

    def test_seller_update_product(self):
        """Test seller updating their product"""
        if not self.test_product_id:
            self.log("No test product ID available", "SKIP")
            return True
        data = {
            "name": "Updated Test Product",
            "price": 39.99,
            "stock": 15
        }
        return self.run_test("Update Product", "PUT", f"seller/products/{self.test_product_id}", 200, data, self.seller_token)[0]

    # Cart Tests
    def test_add_to_cart(self):
        """Test adding item to customer cart"""
        if not self.test_product_id:
            self.log("No test product ID available", "SKIP")
            return True
        data = {
            "product_id": self.test_product_id,
            "quantity": 2
        }
        return self.run_test("Add to Cart", "POST", "cart", 200, data, self.customer_token)[0]

    def test_get_cart(self):
        """Test getting customer cart"""
        return self.run_test("Get Cart", "GET", "cart", 200, token=self.customer_token)[0]

    def test_update_cart_quantity(self):
        """Test updating cart item quantity"""
        if not self.test_product_id:
            self.log("No test product ID available", "SKIP")
            return True
        return self.run_test("Update Cart Item", "PUT", f"cart/{self.test_product_id}?quantity=3", 200, token=self.customer_token)[0]

    # Order Tests
    def test_create_order(self):
        """Test creating an order from cart"""
        data = {
            "delivery_address": "123 Test Street, Test City, Test State 12345",
            "phone": "+1234567890"
        }
        success, response = self.run_test("Create Order", "POST", "orders", 200, data, self.customer_token)
        if success and 'id' in response:
            self.test_order_id = response['id']
            self.log(f"Test order created: {self.test_order_id}", "SUCCESS")
            return True
        return False

    def test_get_customer_orders(self):
        """Test getting customer orders"""
        return self.run_test("Get Customer Orders", "GET", "orders", 200, token=self.customer_token)[0]

    def test_get_seller_orders(self):
        """Test getting seller orders"""
        return self.run_test("Get Seller Orders", "GET", "seller/orders", 200, token=self.seller_token)[0]

    def test_update_order_status(self):
        """Test seller updating order status"""
        if not self.test_order_id:
            self.log("No test order ID available", "SKIP")
            return True
        return self.run_test("Update Order Status", "PUT", f"seller/orders/{self.test_order_id}?status=processing", 200, token=self.seller_token)[0]

    def test_remove_from_cart(self):
        """Test removing item from cart - should run last"""
        if not self.test_product_id:
            self.log("No test product ID available", "SKIP")
            return True
        return self.run_test("Remove from Cart", "DELETE", f"cart/{self.test_product_id}", 200, token=self.customer_token)[0]

    def test_delete_product(self):
        """Test seller deleting their product - should run last"""
        if not self.test_product_id:
            self.log("No test product ID available", "SKIP")
            return True
        return self.run_test("Delete Product", "DELETE", f"seller/products/{self.test_product_id}", 200, token=self.seller_token)[0]

    # Access Control Tests
    def test_customer_cannot_access_seller_endpoints(self):
        """Test that customers cannot access seller-only endpoints"""
        success = True
        
        # Try to create product as customer
        data = {"name": "Unauthorized Product", "description": "Test", "price": 10, "category": "Test", "stock": 1}
        result, _ = self.run_test("Customer Access Seller Endpoint", "POST", "seller/products", 403, data, self.customer_token)
        if not result:
            success = False
            
        return success

    def run_all_tests(self):
        """Run all API tests in proper order"""
        self.log("Starting E-commerce API Tests", "START")
        self.log(f"Testing against: {self.base_url}", "INFO")
        
        test_sequence = [
            # Authentication
            self.test_customer_register,
            self.test_seller_register,
            self.test_auth_me_customer,
            self.test_auth_me_seller,
            
            # Products
            self.test_get_all_products,
            self.test_get_products_by_category,
            self.test_seller_create_product,
            self.test_get_seller_products,
            self.test_get_single_product,
            self.test_seller_update_product,
            
            # Cart Operations
            self.test_add_to_cart,
            self.test_get_cart,
            self.test_update_cart_quantity,
            
            # Orders
            self.test_create_order,
            self.test_get_customer_orders,
            self.test_get_seller_orders,
            self.test_update_order_status,
            
            # Access Control
            self.test_customer_cannot_access_seller_endpoints,
            
            # Cleanup (run last)
            self.test_remove_from_cart,
            self.test_delete_product,
        ]
        
        failed_tests = []
        
        for test in test_sequence:
            try:
                if not test():
                    failed_tests.append(test.__name__)
            except Exception as e:
                self.log(f"Test {test.__name__} failed with exception: {e}", "ERROR")
                failed_tests.append(test.__name__)
        
        # Print final results
        self.log("\n" + "="*60, "RESULT")
        self.log(f"Tests Run: {self.tests_run}", "RESULT")
        self.log(f"Tests Passed: {self.tests_passed}", "RESULT")
        self.log(f"Tests Failed: {self.tests_run - self.tests_passed}", "RESULT")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%", "RESULT")
        
        if failed_tests:
            self.log(f"Failed Tests: {', '.join(failed_tests)}", "RESULT")
        
        self.log("="*60, "RESULT")
        
        return self.tests_passed == self.tests_run

def main():
    tester = EcommerceAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())