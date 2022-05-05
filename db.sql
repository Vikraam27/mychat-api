CREATE TABLE "users" (
  "id" VARCHAR(50) PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "username" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "is_email_verified" BOOL NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE "user_profile" (
  "user_id" VARCHAR(50) NOT NULL,
  "username" TEXT UNIQUE NOT NULL,
  "fullname" TEXT NOT NULL,
  "user_email" TEXT UNIQUE NOT NULL,
  "profile_url" TEXT,
  "gender" VARCHAR(10) NOT NULL,
  "status" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

ALTER TABLE "user_profile"
  ADD CONSTRAINT "fk_user_profile.user_id_users.id" FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE "user_profile"
  ADD CONSTRAINT "fk_user_profile.username_users.username" FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE;
ALTER TABLE "user_profile"
  ADD CONSTRAINT "fk_user_profile.user_email_users.email" FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE;

CREATE TABLE "otp" (
  "otp_num" INTEGER NOT NULL,
  "token" TEXT NOT NULL,
  "timestamp" timestamp DEFAULT current_timestamp NOT NULL
);
CREATE FUNCTION "delete_expired_otp_data"()
  RETURNS trigger
  AS $pga$BEGIN
      DELETE FROM otp WHERE timestamp < NOW() - INTERVAL '5' MINUTE;
      RETURN NEW;
    END;$pga$
  VOLATILE
  LANGUAGE plpgsql;
CREATE TRIGGER "delete_expired_otp_data_trigger"
  AFTER INSERT ON "otp"
  FOR EACH STATEMENT
  EXECUTE PROCEDURE "delete_expired_otp_data"();

CREATE TABLE "authentications" (
  "refresh_token" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);