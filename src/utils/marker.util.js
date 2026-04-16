/**
 * Creates a Google Maps style teardrop marker
 * @param {string} category - The type of restaurant to determine icon/color
 * @returns {HTMLElement} The marker element
 */
export const createCustomMarkerElement = (category) => {
    const el = document.createElement('div');
    el.className = 'marker-container';

    // Define styles based on category
    let bgColor = '#FF5722'; // Default Orange (Restaurant)
    let icon = '🍴';

    switch (category?.toLowerCase()) {
        case 'shabu':
            bgColor = '#795548';
            icon = '🍲';
            break;
        case 'dessert':
            bgColor = '#795548';
            icon = '🍰';
            break;
        case 'fine dining':
            bgColor = '#795548';
            icon = '🥂';
            break;
        case 'bbq':
            bgColor = '#795548';
            icon = '♨️';
            break;
        case 'cafe':
            bgColor = '#795548';
            icon = '☕';
            break;
        case 'japanese':
            bgColor = '#795548';
            icon = '🍱';
            break;
        case 'izakaya':
            bgColor = '#795548';
            icon = '🏮';
            break;
        case 'western':
            bgColor = '#795548';
            icon = '🍝';
            break;
        case 'thai':
            bgColor = '#795548';
            icon = '🌶️';
            break;
        case 'street food':
            bgColor = '#795548';
            icon = '🍢';
            break;
        default:
            bgColor = '#795548';
            icon = '🍴';
    }

    el.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      width: 32px;
      height: 32px;
      background-color: ${bgColor}; 
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 16px;
      ">
        ${icon}
      </div>
    </div>
  `;

    return el;
};