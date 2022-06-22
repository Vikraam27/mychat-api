exports.up = (pgm) => {
  pgm.createTable('room_participant', {
    room_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'chat_room(id)',
      onDelete: 'CASCADE',
    },
    participant_username: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(username)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('room_participant');
};
