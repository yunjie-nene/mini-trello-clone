import React, { useState } from 'react';
import { Card as CardType } from '../types';
import CardModal from './CardModal';

interface CardProps extends CardType {
  onCardUpdated?: () => void;
}

export default function Card({ _id, title, description, list, onCardUpdated }: CardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handleCardClick = () => {
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    
    const handleCardUpdated = () => {
        if (onCardUpdated) {
            onCardUpdated();
        }
    };
    
    return (
        <>
            <div
                key={_id}
                className="bg-white rounded p-3 border border-gray-200 shadow-sm hover:shadow cursor-pointer hover:bg-gray-50 transition duration-200 ease-in-out"
                onClick={handleCardClick}
            >
                <h4 className="font-medium text-gray-700">{title}</h4>
                {description && (
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
            </div>
            
            {isModalOpen && (
                <CardModal 
                    card={{ _id, title, description, list }} 
                    onClose={handleCloseModal}
                    onCardUpdated={handleCardUpdated}
                />
            )}
        </>
    );
}