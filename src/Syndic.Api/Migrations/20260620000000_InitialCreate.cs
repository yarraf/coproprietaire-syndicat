using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Syndic.Api.Migrations;

/// <inheritdoc />
public partial class InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // ── Identity tables ────────────────────────────────────────────────
        migrationBuilder.CreateTable(
            name: "AspNetRoles",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                NormalizedName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                ConcurrencyStamp = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_AspNetRoles", x => x.Id));

        migrationBuilder.CreateTable(
            name: "AspNetUsers",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                ResidentId = table.Column<Guid>(type: "uuid", nullable: true),
                RefreshToken = table.Column<string>(type: "text", nullable: true),
                RefreshTokenExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                UserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                NormalizedUserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                NormalizedEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                PasswordHash = table.Column<string>(type: "text", nullable: true),
                SecurityStamp = table.Column<string>(type: "text", nullable: true),
                ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                PhoneNumber = table.Column<string>(type: "text", nullable: true),
                PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_AspNetUsers", x => x.Id));

        migrationBuilder.CreateTable(
            name: "AspNetRoleClaims",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                ClaimType = table.Column<string>(type: "text", nullable: true),
                ClaimValue = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                table.ForeignKey("FK_AspNetRoleClaims_AspNetRoles_RoleId",
                    x => x.RoleId, "AspNetRoles", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "AspNetUserClaims",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                ClaimType = table.Column<string>(type: "text", nullable: true),
                ClaimValue = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                table.ForeignKey("FK_AspNetUserClaims_AspNetUsers_UserId",
                    x => x.UserId, "AspNetUsers", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "AspNetUserLogins",
            columns: table => new
            {
                LoginProvider = table.Column<string>(type: "text", nullable: false),
                ProviderKey = table.Column<string>(type: "text", nullable: false),
                ProviderDisplayName = table.Column<string>(type: "text", nullable: true),
                UserId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                table.ForeignKey("FK_AspNetUserLogins_AspNetUsers_UserId",
                    x => x.UserId, "AspNetUsers", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "AspNetUserRoles",
            columns: table => new
            {
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                RoleId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                table.ForeignKey("FK_AspNetUserRoles_AspNetRoles_RoleId",
                    x => x.RoleId, "AspNetRoles", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_AspNetUserRoles_AspNetUsers_UserId",
                    x => x.UserId, "AspNetUsers", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "AspNetUserTokens",
            columns: table => new
            {
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                LoginProvider = table.Column<string>(type: "text", nullable: false),
                Name = table.Column<string>(type: "text", nullable: false),
                Value = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                table.ForeignKey("FK_AspNetUserTokens_AspNetUsers_UserId",
                    x => x.UserId, "AspNetUsers", "Id", onDelete: ReferentialAction.Cascade);
            });

        // ── Module Copropriété ─────────────────────────────────────────────
        migrationBuilder.CreateTable(
            name: "residences",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                nom = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                adresse = table.Column<string>(type: "text", nullable: false),
                ville = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table => table.PrimaryKey("pk_residences", x => x.id));

        migrationBuilder.CreateTable(
            name: "residents",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                nom = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                prenom = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                telephone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                compte_active = table.Column<bool>(type: "boolean", nullable: false),
                user_id = table.Column<Guid>(type: "uuid", nullable: true),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table => table.PrimaryKey("pk_residents", x => x.id));

        migrationBuilder.CreateTable(
            name: "groupes_habitation",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                residence_id = table.Column<Guid>(type: "uuid", nullable: false),
                nom = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_groupes_habitation", x => x.id);
                table.ForeignKey("fk_groupes_habitation_residences_residence_id",
                    x => x.residence_id, "residences", "id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "immeubles",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                groupe_habitation_id = table.Column<Guid>(type: "uuid", nullable: false),
                nom_bloc = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                adresse = table.Column<string>(type: "text", nullable: true),
                nb_etages = table.Column<int>(type: "integer", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_immeubles", x => x.id);
                table.ForeignKey("fk_immeubles_groupes_habitation_groupe_habitation_id",
                    x => x.groupe_habitation_id, "groupes_habitation", "id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "lots",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                immeuble_id = table.Column<Guid>(type: "uuid", nullable: false),
                numero = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                etage = table.Column<int>(type: "integer", nullable: false),
                superficie = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                solde = table.Column<decimal>(type: "numeric(14,2)", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_lots", x => x.id);
                table.ForeignKey("fk_lots_immeubles_immeuble_id",
                    x => x.immeuble_id, "immeubles", "id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "lot_residents",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                lot_id = table.Column<Guid>(type: "uuid", nullable: false),
                resident_id = table.Column<Guid>(type: "uuid", nullable: false),
                type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                date_debut = table.Column<DateOnly>(type: "date", nullable: false),
                date_fin = table.Column<DateOnly>(type: "date", nullable: true),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_lot_residents", x => x.id);
                table.ForeignKey("fk_lot_residents_lots_lot_id",
                    x => x.lot_id, "lots", "id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("fk_lot_residents_residents_resident_id",
                    x => x.resident_id, "residents", "id", onDelete: ReferentialAction.Restrict);
            });

        // ── Index Identity ─────────────────────────────────────────────────
        migrationBuilder.CreateIndex("IX_AspNetRoleClaims_RoleId", "AspNetRoleClaims", "RoleId");
        migrationBuilder.CreateIndex("RoleNameIndex", "AspNetRoles", "NormalizedName", unique: true);
        migrationBuilder.CreateIndex("IX_AspNetUserClaims_UserId", "AspNetUserClaims", "UserId");
        migrationBuilder.CreateIndex("IX_AspNetUserLogins_UserId", "AspNetUserLogins", "UserId");
        migrationBuilder.CreateIndex("IX_AspNetUserRoles_RoleId", "AspNetUserRoles", "RoleId");
        migrationBuilder.CreateIndex("EmailIndex", "AspNetUsers", "NormalizedEmail");
        migrationBuilder.CreateIndex("UserNameIndex", "AspNetUsers", "NormalizedUserName", unique: true);

        // ── Index Copropriété ──────────────────────────────────────────────
        migrationBuilder.CreateIndex("ix_groupes_habitation_residence_id", "groupes_habitation", "residence_id");
        migrationBuilder.CreateIndex("ix_immeubles_groupe_habitation_id", "immeubles", "groupe_habitation_id");
        migrationBuilder.CreateIndex("ix_lots_immeuble_id", "lots", "immeuble_id");
        migrationBuilder.CreateIndex("ix_residents_email", "residents", "email", unique: true);
        migrationBuilder.CreateIndex(
            name: "ix_residents_user_id",
            table: "residents",
            column: "user_id",
            unique: true,
            filter: "user_id IS NOT NULL");
        migrationBuilder.CreateIndex("ix_lot_residents_lot_id", "lot_residents", "lot_id");
        migrationBuilder.CreateIndex("ix_lot_residents_resident_id", "lot_residents", "resident_id");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("lot_residents");
        migrationBuilder.DropTable("lots");
        migrationBuilder.DropTable("immeubles");
        migrationBuilder.DropTable("groupes_habitation");
        migrationBuilder.DropTable("residents");
        migrationBuilder.DropTable("residences");
        migrationBuilder.DropTable("AspNetUserTokens");
        migrationBuilder.DropTable("AspNetUserRoles");
        migrationBuilder.DropTable("AspNetUserLogins");
        migrationBuilder.DropTable("AspNetUserClaims");
        migrationBuilder.DropTable("AspNetRoleClaims");
        migrationBuilder.DropTable("AspNetUsers");
        migrationBuilder.DropTable("AspNetRoles");
    }
}
