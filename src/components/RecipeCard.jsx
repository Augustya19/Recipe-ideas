export default function RecipeCard({ meal, onClick }) {
  return (
    <article className="card" onClick={onClick} title="View recipe">
      <img src={meal.strMealThumb} alt={meal.strMeal} loading="lazy" />
      <div className="card-body">
        <h3>{meal.strMeal}</h3>
      </div>
    </article>
  );
}
