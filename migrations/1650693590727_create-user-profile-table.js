exports.up = (pgm) => {
  pgm.createTable('user_profile', {
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    username: {
      type: 'TEXT',
      notNull: true,
      unique: true,
    },
    fullname: {
      type: 'TEXT',
      notNull: true,
    },
    user_email: {
      type: 'TEXT',
      notNull: true,
      unique: true,
    },
    profile_url: {
      type: 'TEXT',
      notNull: false,
    },
    gender: {
      type: 'VARCHAR(10)',
      notNull: true,
    },
    status: {
      type: 'TEXT',
      notNull: false,
    },
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
    },
  });
  pgm.addConstraint('user_profile', 'fk_user_profile.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('user_profile', 'fk_user_profile.username_users.username', 'FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE');
  pgm.addConstraint('user_profile', 'fk_user_profile.user_email_users.email', 'FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('user_profile', 'fk_user_profile.user_id_users.id');
  pgm.dropConstraint('user_profile', 'fk_user_profile.user_email_users.email');
  pgm.dropTable('user_profile');
};
