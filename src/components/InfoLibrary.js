// src/components/InfoLibrary.js

import React from 'react';

function InfoLibrary({ articles, setArticles }) {
  return (
    <div>
      <h2 className="text-2xl font-bold">Biblioteca de Informações</h2>
      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold">{article.title}</h3>
            <p>{article.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InfoLibrary;
