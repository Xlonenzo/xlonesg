import React, { useState } from 'react';

function InfoLibrary({ articles, setArticles }) {
  const [newArticle, setNewArticle] = useState({ title: '', file: null });

  // Função para gerar um resumo automático (simulação)
  const generateSummary = (file) => {
    // Aqui, você pode integrar uma API ou lógica para gerar resumos reais com base no PDF
    return `Resumo automático gerado para o arquivo ${file.name}.`; // Simulação do resumo gerado
  };

  // Função para lidar com o upload de arquivos PDF
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const summary = generateSummary(file); // Gera o resumo automaticamente
    setNewArticle({ ...newArticle, file, summary });
  };

  // Função para adicionar um novo artigo com o arquivo PDF e resumo
  const handleAddArticle = () => {
    if (newArticle.title && newArticle.file) {
      const newArticleEntry = {
        id: articles.length + 1,
        title: newArticle.title,
        summary: newArticle.summary,
        fileUrl: URL.createObjectURL(newArticle.file), // Cria um URL para o arquivo PDF
      };
      setArticles([...articles, newArticleEntry]);
      setNewArticle({ title: '', file: null }); // Limpa o formulário
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Biblioteca de Informações</h2>

      {/* Formulário para adicionar novos artigos com PDF */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
        <input
          type="text"
          value={newArticle.title}
          placeholder="Título do artigo"
          onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
          className="border p-2 mb-2 w-full rounded"
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="border p-2 mb-2 w-full rounded"
        />
        <button
          onClick={handleAddArticle}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Adicionar Artigo
        </button>
      </div>

      {/* Exibição de artigos com links para PDFs */}
      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold">{article.title}</h3>
            <p>{article.summary}</p> {/* Exibe o resumo gerado automaticamente */}
            {article.fileUrl && (
              <a
                href={article.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Abrir PDF
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InfoLibrary;
