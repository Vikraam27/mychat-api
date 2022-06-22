exports.up = (pgm) => {
  pgm.createTable('chat_room', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    creator: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(username)',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('chat_room');
};
