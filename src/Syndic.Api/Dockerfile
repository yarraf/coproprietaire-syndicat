FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/Syndic.Api/Syndic.Api.csproj", "src/Syndic.Api/"]
COPY ["src/Syndic.Shared/Syndic.Shared.csproj", "src/Syndic.Shared/"]
COPY ["src/Syndic.Modules.Identity/Syndic.Modules.Identity.csproj", "src/Syndic.Modules.Identity/"]
COPY ["src/Syndic.Modules.Copropriete/Syndic.Modules.Copropriete.csproj", "src/Syndic.Modules.Copropriete/"]
COPY ["src/Syndic.Modules.Paiement/Syndic.Modules.Paiement.csproj", "src/Syndic.Modules.Paiement/"]
COPY ["src/Syndic.Modules.Assemblees/Syndic.Modules.Assemblees.csproj", "src/Syndic.Modules.Assemblees/"]
COPY ["src/Syndic.Modules.Maintenance/Syndic.Modules.Maintenance.csproj", "src/Syndic.Modules.Maintenance/"]
COPY ["src/Syndic.Modules.Ged/Syndic.Modules.Ged.csproj", "src/Syndic.Modules.Ged/"]
COPY ["src/Syndic.Modules.Notification/Syndic.Modules.Notification.csproj", "src/Syndic.Modules.Notification/"]
RUN dotnet restore "src/Syndic.Api/Syndic.Api.csproj"
COPY . .
WORKDIR "/src/src/Syndic.Api"
RUN dotnet build "Syndic.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Syndic.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Syndic.Api.dll"]
