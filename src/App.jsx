import { useEffect, useMemo, useRef, useState } from "react";
import RecipeCard from "./components/RecipeCard.jsx";
import Modal from "./components/Modal.jsx";
import { lookupById, searchByIngredient, searchByName } from "./api.js";

export default function App() {
  const [mode, setMode] = useState("ingredient"); // 'ingredient' | 'name'
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMeal, setSelectedMeal] = useState(null); // full recipe for modal
  const abortRef = useRef(null);

  const disabled = useMemo(() => query.trim().length === 0, [query]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const search = async () => {
    if (disabled) return;
    setLoading(true);
    setError("");
    setMeals([]);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const list =
        mode === "ingredient"
          ? await searchByIngredient(query, { signal: abortRef.current.signal })
          : await searchByName(query, { signal: abortRef.current.signal });
      setMeals(list);
    } catch (e) {
      if (e.name !== "AbortError") setError("Could not fetch recipes. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (id) => {
    setSelectedMeal({ _loading: true });
    try {
      const full = await lookupById(id);
      setSelectedMeal(full || { _error: true });
    } catch {
      setSelectedMeal({ _error: true });
    }
  };

  const closeModal = () => setSelectedMeal(null);

  const ingredients = (meal) => {
    const items = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const qty = meal[`strMeasure${i}`];
      if (ing && ing.trim()) items.push(`${qty ? qty : ""} ${ing}`.trim());
    }
    return items;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    search();
  };

  return (
    <div className="container">
      <div className="hero-banner">
      <h1>🍲 Discover Delicious Recipes</h1>
      <p>Search meals by ingredient or name and cook something new today!</p>
      </div>

      <header>
        <h1>🍳 Recipe Ideas</h1>
        <p className="sub">Find meals by <b>ingredient</b> or by <b>name</b>.</p>
      </header>

      <form onSubmit={onSubmit} className="controls">
        <div className="tabs" role="tablist" aria-label="search mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "ingredient"}
            className={mode === "ingredient" ? "active" : ""}
            onClick={() => setMode("ingredient")}
          >
            Ingredient
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "name"}
            className={mode === "name" ? "active" : ""}
            onClick={() => setMode("name")}
          >
            Name
          </button>
        </div>

        <input
          type="text"
          placeholder={mode === "ingredient" ? "e.g. chicken, beef, tofu" : "e.g. biryani, pasta"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="search text"
        />

        <button className="primary" disabled={disabled || loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="status" aria-live="polite">
        {error && <div className="error">{error}</div>}
        {!loading && !error && meals?.length === 0 && (
          <div className="hint">Try an ingredient like <b>chicken</b> or <b>paneer</b>.</div>
        )}
      </div>

      <main className="grid">
        {meals?.map((m) => (
          <RecipeCard key={m.idMeal} meal={m} onClick={() => openDetails(m.idMeal)} />
        ))}
      </main>

      <Modal open={!!selectedMeal} onClose={closeModal}>
        {!selectedMeal ? null : selectedMeal._loading ? (
          <div className="modal-content"><p>Loading recipe…</p></div>
        ) : selectedMeal._error ? (
          <div className="modal-content"><p>Could not load this recipe.</p></div>
        ) : (
          <>
            <header className="modal-header">
              <h2>{selectedMeal.strMeal}</h2>
              <button onClick={closeModal} aria-label="Close">✕</button>
            </header>
            <div className="modal-content">
              <img src={selectedMeal.strMealThumb} alt={selectedMeal.strMeal} className="hero" />
              <p className="meta">
                {selectedMeal.strArea ? <span>🌍 {selectedMeal.strArea}</span> : null}{" "}
                {selectedMeal.strCategory ? <span>🍽️ {selectedMeal.strCategory}</span> : null}
              </p>

              <h3>Ingredients</h3>
              <ul className="ingredients">
                {ingredients(selectedMeal).map((x, i) => <li key={i}>{x}</li>)}
              </ul>

              <h3>Instructions</h3>
              <p className="steps">{selectedMeal.strInstructions}</p>

              <div className="links">
                {selectedMeal.strYoutube && (
                  <a href={selectedMeal.strYoutube} target="_blank" rel="noreferrer">▶ Watch on YouTube</a>
                )}{" "}
                {selectedMeal.strSource && (
                  <a href={selectedMeal.strSource} target="_blank" rel="noreferrer">Source</a>
                )}
              </div>
            </div>
          </>
        )}
      </Modal>

      <footer>
        <small>Data by TheMealDB (public test key).</small>
      </footer>
    </div>
  );
}
