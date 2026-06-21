using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Syndic.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPaiementModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ajustements_solde",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    lot_id = table.Column<Guid>(type: "uuid", nullable: false),
                    montant = table.Column<decimal>(type: "numeric(14,2)", nullable: false),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    libelle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    periode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    cree_par = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ajustements_solde", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "paiements",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    lot_id = table.Column<Guid>(type: "uuid", nullable: false),
                    resident_id = table.Column<Guid>(type: "uuid", nullable: false),
                    montant = table.Column<decimal>(type: "numeric(14,2)", nullable: false),
                    periode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    mode_paiement = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    justificatif_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    valide_par = table.Column<Guid>(type: "uuid", nullable: true),
                    date_validation = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    motif_rejet = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_paiements", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_ajustements_solde_lot_id",
                table: "ajustements_solde",
                column: "lot_id");

            migrationBuilder.CreateIndex(
                name: "ix_paiements_lot_id",
                table: "paiements",
                column: "lot_id");

            migrationBuilder.CreateIndex(
                name: "ix_paiements_resident_id",
                table: "paiements",
                column: "resident_id");

            migrationBuilder.CreateIndex(
                name: "ix_paiements_statut",
                table: "paiements",
                column: "statut");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ajustements_solde");

            migrationBuilder.DropTable(
                name: "paiements");
        }
    }
}
