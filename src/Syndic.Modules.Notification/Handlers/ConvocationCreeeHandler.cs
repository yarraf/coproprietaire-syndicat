using MediatR;
using Syndic.Modules.Notification.Application.Services;
using Syndic.Shared.Events;

namespace Syndic.Modules.Notification.Handlers;

internal sealed class ConvocationCreeeHandler(INotificationService notificationService)
    : INotificationHandler<ConvocationCreee>
{
    public async Task Handle(ConvocationCreee notification, CancellationToken cancellationToken)
    {
        var titre = "Convocation AG";
        var body = $"{notification.Titre} — {notification.DateAg:dd/MM/yyyy HH:mm}";

        var tasks = notification.ResidentIds.Select(residentId =>
            notificationService.SendPushAsync(residentId, titre, body, "convocation_creee", ct: cancellationToken));

        await Task.WhenAll(tasks);
    }
}
