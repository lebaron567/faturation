import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({
    size = 'medium',
    color = 'primary',
    message = 'Chargement...',
    overlay = false,
    fullscreen = false
}) => {
    const sizeClass = `spinner-${size}`;
    const colorClass = `spinner-${color}`;

    const spinner = (
        <div className={`loading-container ${overlay ? 'overlay' : ''} ${fullscreen ? 'fullscreen' : ''}`}>
            <div className="loading-content">
                <div className={`spinner ${sizeClass} ${colorClass}`}>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                {message && <p className="loading-message">{message}</p>}
            </div>
        </div>
    );

    return spinner;
};

// Composant de skeleton pour le chargement de listes
export const SkeletonCard = ({ count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="skeleton-card">
                    <div className="skeleton-header">
                        <div className="skeleton-line skeleton-title"></div>
                        <div className="skeleton-circle"></div>
                    </div>
                    <div className="skeleton-body">
                        <div className="skeleton-line skeleton-text"></div>
                        <div className="skeleton-line skeleton-text short"></div>
                        <div className="skeleton-line skeleton-text"></div>
                    </div>
                    <div className="skeleton-footer">
                        <div className="skeleton-button"></div>
                        <div className="skeleton-button"></div>
                    </div>
                </div>
            ))}
        </>
    );
};

// Composant de chargement pour les tableaux
export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="skeleton-table">
            <div className="skeleton-table-header">
                {Array.from({ length: columns }).map((_, index) => (
                    <div key={index} className="skeleton-th"></div>
                ))}
            </div>
            <div className="skeleton-table-body">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="skeleton-table-row">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <div key={colIndex} className="skeleton-td"></div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LoadingSpinner;