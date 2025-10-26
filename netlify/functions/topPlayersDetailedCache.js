/**
 * Pre-calculated top 20 players with 5 suplentes (substitutes)
 * Includes detailed explanations for each player's ranking
 */

const TOP_20_PLAYERS_DETAILED_HTML = `<h1>Os 20 Melhores Jogadores + 5 Suplentes da História do Sporting Clube Farense</h1>
<p><strong>Ranking baseado em:</strong> Tempo de serviço (30%), Número de jogos (30%), Importância biográfica (40%)</p>

<h2>⭐ EQUIPA TITULAR (20 Jogadores)</h2>

<h3>1. Hassan Nader - Score: 54.3/100</h3>
<ul>
<li><strong>Motivo:</strong> O Rei dos Golos. 208 jogos em apenas 3 anos. Marroquino que se tornou lenda em Faro. Importância histórica máxima (100/100) por revolucionar o futebol do clube.</li>
<li><strong>Dados:</strong> 3 anos de serviço | 208 jogos | Importância: 100/100</li>
</ul>

<h3>2. Luisão - Score: 48.4/100</h3>
<ul>
<li><strong>Motivo:</strong> Brasileiro que marcou os melhores de Portugal. 200 jogos disputados. Presença marcante em 8 épocas. Lenda viva do futebol português.</li>
<li><strong>Dados:</strong> 8 anos de serviço | 200 jogos | Importância: 79/100</li>
</ul>

<h3>3. Bento - Score: 48.2/100</h3>
<ul>
<li><strong>Motivo:</strong> "Bentinho". Farense na veia durante 17 anos (maior longevidade entre titulares). Símbolo de dedicação ao clube. Importância histórica muito alta (95/100).</li>
<li><strong>Dados:</strong> 17 anos de serviço | Importância: 95/100</li>
</ul>

<h3>4. António Gago - Score: 47.8/100</h3>
<ul>
<li><strong>Motivo:</strong> Sócio nº1 do clube. 13 anos de serviço. Figura fundadora e histórica máxima importância (100/100). Escreveu páginas indeléveis na história algarvio.</li>
<li><strong>Dados:</strong> 13 anos de serviço | Importância: 100/100</li>
</ul>

<h3>5. José Ventura - Score: 46.2/100</h3>
<ul>
<li><strong>Motivo:</strong> Capitão que mudou de posição e conquistou tudo. 15 anos de serviço. Importância histórica muito alta (93/100). Liderança marcante.</li>
<li><strong>Dados:</strong> 15 anos de serviço | Importância: 93/100</li>
</ul>

<h3>6. Paco Fortes - Score: 45.4/100</h3>
<ul>
<li><strong>Motivo:</strong> O Catalão Mais Farense de Que Há Memória. "El Feo". 9 anos de dedicação. Importância máxima (100/100) por impacto cultural e desportivo.</li>
<li><strong>Dados:</strong> 9 anos de serviço | Importância: 100/100</li>
</ul>

<h3>7. Atraca - Score: 44.2/100</h3>
<ul>
<li><strong>Motivo:</strong> Do Farense ao FC Porto e de volta à glória. 7 anos. Importância histórica máxima (100/100). Simboliza a qualidade do futebol farense.</li>
<li><strong>Dados:</strong> 7 anos de serviço | Importância: 100/100</li>
</ul>

<h3>8. Skoda - Score: 43.7/100</h3>
<ul>
<li><strong>Motivo:</strong> Primeiro Algarvio na Seleção A. 169 jogos em 9 anos. Pioneiro que elevou o prestígio do clube. Importância: 70/100.</li>
<li><strong>Dados:</strong> 9 anos de serviço | 169 jogos | Importância: 70/100</li>
</ul>

<h3>9. Bruno - Score: 43.6/100</h3>
<ul>
<li><strong>Motivo:</strong> Goleador dos campeonatos distritais. 17 anos de serviço. Importância muito alta (83/100). Longevidade com consistência.</li>
<li><strong>Dados:</strong> 17 anos de serviço | Importância: 83/100</li>
</ul>

<h3>10. Queimado - Score: 43.4/100</h3>
<ul>
<li><strong>Motivo:</strong> "Rancinho" - Extremo veloz dos anos 50. 13 anos. Importância histórica muito alta (89/100). Velocidade lendária.</li>
<li><strong>Dados:</strong> 13 anos de serviço | Importância: 89/100</li>
</ul>

<h3>11. Sequeira - Score: 42.6/100</h3>
<ul>
<li><strong>Motivo:</strong> Defesa das três subidas históricas. 13 anos de excelência defensiva. Importância: 87/100. Pilar defensivo de épocas gloriosas.</li>
<li><strong>Dados:</strong> 13 anos de serviço | Importância: 87/100</li>
</ul>

<h3>12. João Coelho - Score: 42.2/100</h3>
<ul>
<li><strong>Motivo:</strong> Atleta completo dos anos 30. Maior longevidade (19 anos). Importância: 77/100. Pioneiro que corria como o vento.</li>
<li><strong>Dados:</strong> 19 anos de serviço | Importância: 77/100</li>
</ul>

<h3>13. Walter Gralho - Score: 42/100</h3>
<ul>
<li><strong>Motivo:</strong> O sobrinho que honrou o apelido. 16 anos. Importância: 81/100. Herdeiro de uma lenda (João Gralho).</li>
<li><strong>Dados:</strong> 16 anos de serviço | Importância: 81/100</li>
</ul>

<h3>14. Zita - Score: 41.2/100</h3>
<ul>
<li><strong>Motivo:</strong> Primeiro Algarvio nos Três Grandes. Pioneiro histórico. 8 anos. Importância: 91/100. Abriu caminho para gerações.</li>
<li><strong>Dados:</strong> 8 anos de serviço | Importância: 91/100</li>
</ul>

<h3>15. Assunção "Chico Setúbal" - Score: 40.6/100</h3>
<ul>
<li><strong>Motivo:</strong> Guarda-redes de 11 anos. Importância: 85/100. Segurança defensiva em décadas de história do clube.</li>
<li><strong>Dados:</strong> 11 anos de serviço | Importância: 85/100</li>
</ul>

<h3>16. Calotas - Score: 40.2/100</h3>
<ul>
<li><strong>Motivo:</strong> Guarda-redes da subida histórica. Cresceu no clube desde júnior. 5 anos. Importância: 93/100. Momento crucial de glória.</li>
<li><strong>Dados:</strong> 5 anos de serviço | Importância: 93/100</li>
</ul>

<h3>17. Joaquim Reina - Score: 40.2/100</h3>
<ul>
<li><strong>Motivo:</strong> Defesa que se tornou treinador da glória. 13 anos. Importância: 81/100. Evoluiu de jogador a líder estratégico.</li>
<li><strong>Dados:</strong> 13 anos de serviço | Importância: 81/100</li>
</ul>

<h3>18. Rafael Marti - Score: 40/100</h3>
<ul>
<li><strong>Motivo:</strong> Primeiro Espanhol que se fez Farense. Importância máxima (100/100). Símbolo de internacionalização.</li>
<li><strong>Dados:</strong> Importância: 100/100</li>
</ul>

<h3>19. Luís Candeias - Score: 39.9/100</h3>
<ul>
<li><strong>Motivo:</strong> Guarda-redes de Faro que viajou até ao Norte. 22 jogos em 9 anos. Importância: 83/100. Representou o clube fora de casa.</li>
<li><strong>Dados:</strong> 9 anos de serviço | 22 jogos | Importância: 83/100</li>
</ul>

<h3>20. Vilanova "Sainhas" - Score: 39.8/100</h3>
<ul>
<li><strong>Motivo:</strong> Avançado do Oitavo Exército. 11 anos. Importância: 83/100. Portimãonense que se identificou com Faro. Última posição titular destaca transição.</li>
<li><strong>Dados:</strong> 11 anos de serviço | Importância: 83/100</li>
</ul>

<hr>

<h2>🔄 SUPLENTES (Banco - Próximos 5)</h2>

<h3>21. Balela - Score: 39.2/100</h3>
<ul>
<li><strong>Motivo para ser suplente:</strong> Score ligeiramente inferior. Avançado baixinho que marcava alto. 10 anos. Importância: 77/100. Poderia ser titular consoante tática.</li>
<li><strong>Dados:</strong> 10 anos de serviço | Importância: 77/100</li>
</ul>

<h3>22. Pitico - Score: 38.9/100</h3>
<ul>
<li><strong>Motivo para ser suplente:</strong> Apenas 29 jogos em 9 anos (média mais baixa). Brasileiro que jogou até aos 53 anos. Longevidade fora de campo. Importância: 72/100.</li>
<li><strong>Dados:</strong> 9 anos de serviço | 29 jogos | Importância: 72/100</li>
</ul>

<h3>23. Hajry Redouane - Score: 38.2/100</h3>
<ul>
<li><strong>Motivo para ser suplente:</strong> Apenas 3 anos de serviço (pouco tempo). Marroquino que marcou uma época. Importância: 81/100. Carreira curta mas intensa.</li>
<li><strong>Dados:</strong> 3 anos de serviço | Importância: 81/100</li>
</ul>

<h3>24. Ismael - Score: 38.1/100</h3>
<ul>
<li><strong>Motivo para ser suplente:</strong> Guarda-redes e treinador histórico. 23 épocas é recorde de longevidade. Importância: 88/100. Posição de suplente devido score global, mas impacto histórico enorme.</li>
<li><strong>Dados:</strong> 23 anos de serviço | Importância: 88/100</li>
</ul>

<h3>25. Almeida - Score: 37.8/100</h3>
<ul>
<li><strong>Motivo para ser suplente:</strong> 55 jogos na Primeira (menor que outros titulares). Médio. 6 anos. Importância: 72/100. Transição para treinador campeão.</li>
<li><strong>Dados:</strong> 6 anos de serviço | 55 jogos | Importância: 72/100</li>
</ul>

<hr>

<h2>📊 Explicação dos Critérios de Seleção</h2>
<p><strong>Por que alguns jogadores são titulares e outros suplentes?</strong></p>
<ul>
<li><strong>Hassan Nader (1º) vs Hajry (23º):</strong> Hassan: 208 jogos em 3 anos vs Hajry: poucos jogos em 3 anos. Hassan tem frequência e impacto muito maiores.</li>
<li><strong>Bento (3º) vs Balela (21º):</strong> Bento: 17 anos de serviço vs Balela: 10 anos. Longevidade e consistência são cruciais.</li>
<li><strong>Ismael (24º) é suplente apesar de 23 anos:</strong> Como guarda-redes, teve menos oportunidades de jogos. Mas sua permanência 23 épocas e impacto como treinador o mantêm no top 25.</li>
<li><strong>Pitico (22º) é suplente:</strong> Apesar de 9 anos, apenas 29 jogos. Brasileiro que permaneceu muito tempo mas com pouca participação em campo.</li>
</ul>`;

module.exports = {
  "getFormattedResponse": function() {
    return TOP_20_PLAYERS_DETAILED_HTML;
  }
};
