import React, { useState } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAuth } from '../contexts/AuthContext';
import '../styles/KeyboardShortcuts.css';

const KeyboardShortcuts = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { isAuthenticated } = useAuth();
    const { shortcuts } = useKeyboardShortcuts(isAuthenticated);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    if (!isAuthenticated) return null;

    return (
        <>
            <button
                className="shortcuts-toggle"
                onClick={toggleVisibility}
                title="Afficher les raccourcis clavier (Ctrl + ?)"
            >
                ⌨️
            </button>

            {isVisible && (
                <div className="shortcuts-overlay" onClick={() => setIsVisible(false)}>
                    <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
                        <div className="shortcuts-header">
                            <h3>⌨️ Raccourcis clavier</h3>
                            <button
                                className="close-btn"
                                onClick={() => setIsVisible(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="shortcuts-content">
                            <p className="shortcuts-description">
                                Utilisez ces raccourcis pour naviguer plus rapidement :
                            </p>

                            <div className="shortcuts-list">
                                {shortcuts.map((shortcut, index) => (
                                    <div key={index} className="shortcut-item">
                                        <span className="shortcut-key">{shortcut.key}</span>
                                        <span className="shortcut-description">{shortcut.description}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="shortcuts-note">
                                <p>💡 <strong>Astuce :</strong> Ces raccourcis fonctionnent partout sauf dans les champs de saisie.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default KeyboardShortcuts;
