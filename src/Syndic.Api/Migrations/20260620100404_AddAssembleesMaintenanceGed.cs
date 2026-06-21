using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Syndic.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAssembleesMaintenanceGed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "assemblees",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    residence_id = table.Column<Guid>(type: "uuid", nullable: false),
                    titre = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    lieu = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    ordre_du_jour = table.Column<string>(type: "text", nullable: false),
                    statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    pv_document_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_assemblees", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    residence_id = table.Column<Guid>(type: "uuid", nullable: true),
                    immeuble_id = table.Column<Guid>(type: "uuid", nullable: true),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    titre = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    fichier_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    visible_residents = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_documents", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "maintenance_planifiee",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    residence_id = table.Column<Guid>(type: "uuid", nullable: false),
                    immeuble_id = table.Column<Guid>(type: "uuid", nullable: true),
                    type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    libelle = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    date_prevue = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    recurrence = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    visible_residents = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_maintenance_planifiee", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "signalements",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    lot_id = table.Column<Guid>(type: "uuid", nullable: true),
                    immeuble_id = table.Column<Guid>(type: "uuid", nullable: true),
                    resident_id = table.Column<Guid>(type: "uuid", nullable: false),
                    titre = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    photo_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    assigne_a = table.Column<Guid>(type: "uuid", nullable: true),
                    reponse = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_signalements", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_assemblees_residence_id",
                table: "assemblees",
                column: "residence_id");

            migrationBuilder.CreateIndex(
                name: "ix_documents_residence_id",
                table: "documents",
                column: "residence_id");

            migrationBuilder.CreateIndex(
                name: "ix_documents_type",
                table: "documents",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_planifiee_residence_id",
                table: "maintenance_planifiee",
                column: "residence_id");

            migrationBuilder.CreateIndex(
                name: "ix_signalements_resident_id",
                table: "signalements",
                column: "resident_id");

            migrationBuilder.CreateIndex(
                name: "ix_signalements_statut",
                table: "signalements",
                column: "statut");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "assemblees");

            migrationBuilder.DropTable(
                name: "documents");

            migrationBuilder.DropTable(
                name: "maintenance_planifiee");

            migrationBuilder.DropTable(
                name: "signalements");
        }
    }
}
