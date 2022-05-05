exports.up = (pgm) => {
  pgm.createTable('otp', {
    otp_num: {
      type: 'INTEGER',
      notNull: true,
    },
    token: {
      type: 'TEXT',
      notNull: true,
    },
    timestamp: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createFunction(
    'delete_expired_otp_data',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
    },
    `BEGIN
      DELETE FROM otp WHERE timestamp < NOW() - INTERVAL '5' MINUTE;
      RETURN NEW;
    END;`,
  );

  pgm.createTrigger('otp', 'delete_expired_otp_data_trigger', {
    when: 'AFTER',
    operation: 'INSERT',
    language: 'plpgsql',
    function: 'delete_expired_otp_data',
  });
};

exports.down = (pgm) => {
  pgm.dropTable('otp');
  pgm.dropTrigger('otp', 'delete_expired_otp_data_trigger', {
    ifExists: true,
  });
  pgm.dropFunction('delete_expired_otp_data');
};
