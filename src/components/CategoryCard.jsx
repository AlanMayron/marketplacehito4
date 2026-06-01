import { Link } from "react-router-dom";

const CategoryCard = ({ name }) => {
  return (
    <Link
      to={`/posts?categoria=${encodeURIComponent(name)}`}
      className="category-card"
    >
      <div className="category-icon"></div>
      <strong>{name}</strong>
    </Link>
  );
};

export default CategoryCard;