@echo off
REM === Tạo cấu trúc thư mục FRONTEND cho DFS ===

mkdir frontend
cd frontend

:: file gốc
echo <!DOCTYPE html^>^<html^>^<head^>^<title^>DFS^</title^>^</head^>^<body^>^<div id="root"^>^</div^>^</body^>^</html^> > index.html
echo {} > package.json
echo VITE_API_URL=http://localhost:5000 > .env
echo {} > vite.config.js

:: src
mkdir src
cd src
mkdir assets components pages hooks context services utils router store

:: assets
mkdir assets\images assets\icons assets\styles
echo /* global css */ > assets\styles\global.css

:: components
mkdir components\common components\layout components\charts
echo // Button.jsx > components\common\Button.jsx
echo // Header.jsx > components\layout\Header.jsx
echo // Footer.jsx > components\layout\Footer.jsx
echo // SalesChart.jsx > components\charts\SalesChart.jsx

:: pages
mkdir pages\customer pages\shop pages\admin pages\sales pages\support pages\auth pages\errors

:: customer
echo // HomePage.jsx > pages\customer\HomePage.jsx
echo // ProductDetail.jsx > pages\customer\ProductDetail.jsx
echo // Cart.jsx > pages\customer\Cart.jsx
echo // Checkout.jsx > pages\customer\Checkout.jsx
echo // Orders.jsx > pages\customer\Orders.jsx
echo // Wishlist.jsx > pages\customer\Wishlist.jsx
echo // Profile.jsx > pages\customer\Profile.jsx
echo // Wallet.jsx > pages\customer\Wallet.jsx

:: shop
echo // Dashboard.jsx > pages\shop\Dashboard.jsx
echo // ManageProducts.jsx > pages\shop\ManageProducts.jsx
echo // ManageOrders.jsx > pages\shop\ManageOrders.jsx
echo // ManageRefunds.jsx > pages\shop\ManageRefunds.jsx
echo // ManageCustomers.jsx > pages\shop\ManageCustomers.jsx
echo // ManageMarketing.jsx > pages\shop\ManageMarketing.jsx
echo // ManageReviews.jsx > pages\shop\ManageReviews.jsx
echo // ShopWallet.jsx > pages\shop\ShopWallet.jsx

:: admin
echo // SystemConfig.jsx > pages\admin\SystemConfig.jsx
echo // AuditLogs.jsx > pages\admin\AuditLogs.jsx
echo // Reconciliation.jsx > pages\admin\Reconciliation.jsx
echo // ApiKeyManager.jsx > pages\admin\ApiKeyManager.jsx

:: sales
echo // SalesOrders.jsx > pages\sales\SalesOrders.jsx
echo // SalesProducts.jsx > pages\sales\SalesProducts.jsx

:: support
echo // Tickets.jsx > pages\support\Tickets.jsx
echo // TicketDetail.jsx > pages\support\TicketDetail.jsx

:: auth
echo // Login.jsx > pages\auth\Login.jsx
echo // Register.jsx > pages\auth\Register.jsx
echo // ForgotPassword.jsx > pages\auth\ForgotPassword.jsx

:: errors
echo // NotFound.jsx > pages\errors\NotFound.jsx
echo // ServerError.jsx > pages\errors\ServerError.jsx

:: hooks
echo // useAuth.js > hooks\useAuth.js
echo // useCart.js > hooks\useCart.js
echo // useFetch.js > hooks\useFetch.js

:: context
echo // AuthContext.jsx > context\AuthContext.jsx
echo // CartContext.jsx > context\CartContext.jsx
echo // ThemeContext.jsx > context\ThemeContext.jsx

:: services
echo // apiClient.js > services\apiClient.js
echo // authService.js > services\authService.js
echo // productService.js > services\productService.js
echo // orderService.js > services\orderService.js
echo // walletService.js > services\walletService.js
echo // supportService.js > services\supportService.js

:: utils
echo // formatDate.js > utils\formatDate.js
echo // formatCurrency.js > utils\formatCurrency.js
echo // validators.js > utils\validators.js

:: router
echo // index.jsx > router\index.jsx

:: store
echo // authSlice.js > store\authSlice.js
echo // cartSlice.js > store\cartSlice.js
echo // productSlice.js > store\productSlice.js

:: src root files
echo // App.jsx > App.jsx
echo // main.jsx > main.jsx
echo // vite-env.d.ts > vite-env.d.ts

cd ..\..

echo.
echo ✅ Hoàn tất: FRONTEND đã được tạo đầy đủ!
pause
