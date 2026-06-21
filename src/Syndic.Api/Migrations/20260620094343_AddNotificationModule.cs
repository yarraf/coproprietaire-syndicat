using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Syndic.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "devices",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    resident_id = table.Column<Guid>(type: "uuid", nullable: false),
                    push_token = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    plateforme = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    derniere_activite = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_devices", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notifications_log",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    resident_id = table.Column<Guid>(type: "uuid", nullable: false),
                    canal = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    type_evenement = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    payload = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notifications_log", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "preferences_notification",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    resident_id = table.Column<Guid>(type: "uuid", nullable: false),
                    canal_push = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_preferences_notification", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_devices_push_token",
                table: "devices",
                column: "push_token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_devices_resident_id",
                table: "devices",
                column: "resident_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_log_resident_id",
                table: "notifications_log",
                column: "resident_id");

            migrationBuilder.CreateIndex(
                name: "ix_preferences_notification_resident_id",
                table: "preferences_notification",
                column: "resident_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "devices");

            migrationBuilder.DropTable(
                name: "notifications_log");

            migrationBuilder.DropTable(
                name: "preferences_notification");
        }
    }
}
