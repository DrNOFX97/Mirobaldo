from flask import Flask, request, jsonify, send_from_directory
import os
import uuid

app = Flask(__name__, static_folder='public')

# Simulação de um banco de dados de conversas
chats = {} # {chat_id: {title: "...", messages: [...]}}

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route('/api/history', methods=['GET'])
def get_history():
    history = []
    for chat_id, chat_data in chats.items():
        history.append({
            'id': chat_id,
            'title': chat_data.get('title', f'Chat {chat_id}'),
            'last_message': chat_data['messages'][-1]['text'] if chat_data['messages'] else ''
        })
    return jsonify(history)

@app.route('/api/chat', methods=['POST'])
def handle_chat():
    data = request.json
    user_message = data.get('message')
    chat_id = data.get('chatId')

    if not user_message:
        return jsonify({'error': 'Mensagem vazia'}), 400

    if chat_id not in chats:
        chat_id = str(uuid.uuid4())
        chats[chat_id] = {'title': f'Nova Conversa {len(chats) + 1}', 'messages': []}

    chats[chat_id]['messages'].append({'sender': 'user', 'text': user_message})

    # Lógica de resposta do chatbot (simulada)
    bot_reply = f"Você disse: '{user_message}'. Esta é uma resposta simulada."
    chats[chat_id]['messages'].append({'sender': 'bot', 'text': bot_reply})

    return jsonify({'reply': bot_reply, 'chatId': chat_id})

@app.route('/api/chat/<chat_id>', methods=['GET'])
def get_chat(chat_id):
    chat_data = chats.get(chat_id)
    if not chat_data:
        return jsonify({'error': 'Chat não encontrado'}), 404
    return jsonify(chat_data)

if __name__ == '__main__':
    app.run(debug=True, port=5001)