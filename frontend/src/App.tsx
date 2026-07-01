import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MoviesPage } from "./pages/MoviesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MoviesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
