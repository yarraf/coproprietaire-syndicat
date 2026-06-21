using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Syndic.Api.Infrastructure;

public sealed class GlobalExceptionHandler(IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var status = ex switch
        {
            KeyNotFoundException      => StatusCodes.Status404NotFound,
            InvalidOperationException => StatusCodes.Status409Conflict,
            ArgumentException         => StatusCodes.Status400BadRequest,
            _                         => StatusCodes.Status500InternalServerError
        };

        ctx.Response.StatusCode = status;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext    = ctx,
            Exception      = ex,
            ProblemDetails = new ProblemDetails { Status = status, Title = ex.Message }
        });
    }
}
