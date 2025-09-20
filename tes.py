from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydatabase.db' # Ganti dengan URI database Anda
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return '<User %r>' % self.username

@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')

    # Menggunakan parameterized query dengan SQLAlchemy
    try:
        new_user = User(username=username, email=email)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    # Menggunakan parameterized query dengan SQLAlchemy
    user = User.query.get(user_id)
    if user:
        return jsonify({'id': user.id, 'username': user.username, 'email': user.email})
    return jsonify({'error': 'User not found'}), 404

#Contoh menggunakan text() untuk query yang lebih kompleks (hindari jika memungkinkan)
@app.route('/users_by_email/<email>', methods=['GET'])
def get_user_by_email(email):
    try:
      stmt = text("SELECT * FROM User WHERE email = :email")
      user = db.engine.execute(stmt, email=email).fetchone()
      if user:
          return jsonify({'id': user.id, 'username': user.username, 'email': user.email})
      return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)