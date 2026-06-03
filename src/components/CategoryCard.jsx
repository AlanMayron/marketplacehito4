import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLaptop,
  faShirt,
  faCouch,
  faDumbbell,
  faBook,
  faPalette,
  faShapes,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

const categoryIcons = {
  Tecnología: faLaptop,
  Ropa: faShirt,
  Hogar: faCouch,
  Deportes: faDumbbell,
  Libros: faBook,
  Manualidades: faPalette,
  Otro: faShapes,
};

const CategoryCard = ({ name }) => {
  const icon = categoryIcons[name] || faTag;

  return (
    <Link
      to={`/posts?categoria=${encodeURIComponent(name)}`}
      className="category-card category-card-modern"
    >
      <div className="category-icon">
        <FontAwesomeIcon icon={icon} />
      </div>

      <div>
        <strong>{name}</strong>
        <span>Ver publicaciones</span>
      </div>
    </Link>
  );
};

export default CategoryCard;