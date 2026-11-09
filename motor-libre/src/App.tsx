import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import './styles/modern.css'
import { HomePage } from './pages/homePage';
import { CatalogPage } from './pages/catalogPage';
import { ContactPage } from './pages/contactPage';
import { NotFoundPage } from './pages/notFoundPage';
import { ProductPage } from './pages/productDetailPage';
import { CartProvider } from './context/cartContext';
import { AuthProvider } from './context/authContext';
import { ThemeProvider } from './context/themeContext';
import { FavoritesProvider } from './context/favoritesContext';
import { ToastProvider } from './context/toastContext';
import { CartPage } from './pages/cartPage';
import { ReservationsLookupPage } from './pages/reservationsLookupPage';
import { LoginPage } from './pages/loginPage';
import { RegisterPage } from './pages/registerPage';
import { ForgotPasswordPage } from './pages/forgotPasswordPage';
import { ResetPasswordPage } from './pages/resetPasswordPage';
import { ProfilePage } from './pages/profilePage';
import { FavoritesPage } from './pages/favoritesPage';
import { ProtectedRoute, GuestOnlyRoute } from './components/auth/protectedRoute';
import { Navbar } from './components/layout/navbar';
import { Footer } from './components/layout/footer';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <FavoritesProvider>
              <CartProvider>
                <div className="app-shell">
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalogo" element={<CatalogPage />} />
                    <Route path="/contacto" element={<ContactPage />} />
                    <Route path="/producto/:id" element={<ProductPage />} />
                    <Route path="/carrito" element={<CartPage />} />
                    <Route path="/favoritos" element={<FavoritesPage />} />

                    <Route element={<GuestOnlyRoute />}>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/registro" element={<RegisterPage />} />
                    </Route>
                    <Route path="/recuperar" element={<ForgotPasswordPage />} />
                    <Route path="/restablecer" element={<ResetPasswordPage />} />

                    <Route element={<ProtectedRoute />}>
                      <Route path="/perfil" element={<ProfilePage />} />
                      <Route path="/reservas" element={<ReservationsLookupPage />} />
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                  <Footer />
                </div>
              </CartProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App
