/**
 * Pre-calculated top 20 players cache
 * Generated based on scoring criteria: years of service, games played, biographical importance
 */

// Pre-compiled HTML response for instant delivery
const TOP_20_PLAYERS_HTML = `<h1>Os 20 Melhores Jogadores da História do Sporting Clube Farense</h1>
<p>Ranking baseado em critérios de tempo como sénior, número de jogos e importância biográfica.</p>
<h2>1. Hassan Nader</h2>
<p><strong>Score:</strong> 54.3/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 3 anos</li>
<li><strong>Jogos pelo Clube:</strong> 208</li>
<li><strong>Importância Biográfica:</strong> 100/100</li>
<li><strong>Descrição:</strong> O Rei dos Golos - Marroquino que se tornou lenda em Faro</li>
</ul>
<h2>2. Luisão</h2>
<p><strong>Score:</strong> 48.4/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 8 anos</li>
<li><strong>Jogos pelo Clube:</strong> 200</li>
<li><strong>Importância Biográfica:</strong> 79/100</li>
</ul>
<h2>3. Bento</h2>
<p><strong>Score:</strong> 48.2/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 17 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 95/100</li>
</ul>
<h2>4. António Gago</h2>
<p><strong>Score:</strong> 47.8/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 13 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 100/100</li>
</ul>
<h2>5. José Ventura</h2>
<p><strong>Score:</strong> 46.2/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 15 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 93/100</li>
</ul>
<h2>6. Paco Fortes</h2>
<p><strong>Score:</strong> 45.4/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 9 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 100/100</li>
<li><strong>Descrição:</strong> O Catalão Mais Farense de Que Há Memória</li>
</ul>
<h2>7. Atraca</h2>
<p><strong>Score:</strong> 44.2/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 7 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 100/100</li>
</ul>
<h2>8. Skoda</h2>
<p><strong>Score:</strong> 43.7/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 9 anos</li>
<li><strong>Jogos pelo Clube:</strong> 169</li>
<li><strong>Importância Biográfica:</strong> 70/100</li>
</ul>
<h2>9. Bruno</h2>
<p><strong>Score:</strong> 43.6/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 17 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 83/100</li>
</ul>
<h2>10. Queimado</h2>
<p><strong>Score:</strong> 43.4/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 13 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 89/100</li>
</ul>
<h2>11. Sequeira</h2>
<p><strong>Score:</strong> 42.6/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 13 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 87/100</li>
</ul>
<h2>12. João Coelho</h2>
<p><strong>Score:</strong> 42.2/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 19 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 77/100</li>
</ul>
<h2>13. Walter Gralho</h2>
<p><strong>Score:</strong> 42/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 16 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 81/100</li>
</ul>
<h2>14. Zita</h2>
<p><strong>Score:</strong> 41.2/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 8 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 91/100</li>
</ul>
<h2>15. Assunção</h2>
<p><strong>Score:</strong> 40.6/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 11 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 85/100</li>
</ul>
<h2>16. Calotas</h2>
<p><strong>Score:</strong> 40.2/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 5 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 93/100</li>
</ul>
<h2>17. Reina</h2>
<p><strong>Score:</strong> 40.2/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 13 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 81/100</li>
</ul>
<h2>18. Marti</h2>
<p><strong>Score:</strong> 40/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 0 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 100/100</li>
</ul>
<h2>19. Candeias</h2>
<p><strong>Score:</strong> 39.9/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 9 anos</li>
<li><strong>Jogos pelo Clube:</strong> 22</li>
<li><strong>Importância Biográfica:</strong> 83/100</li>
</ul>
<h2>20. Vilanova</h2>
<p><strong>Score:</strong> 39.8/100</p>
<ul>
<li><strong>Anos de Serviço:</strong> 11 anos</li>
<li><strong>Jogos pelo Clube:</strong> 0</li>
<li><strong>Importância Biográfica:</strong> 83/100</li>
</ul>`;

module.exports = {
  "getFormattedResponse": function() {
    return TOP_20_PLAYERS_HTML;
  }
};
