export const config = {
  clientId:
    "534447448870-7slg5kbr80ki012p30981cm7smotuc3f.apps.googleusercontent.com",
  propertyId: "555394741",
  owner: "raphaelrochabcc@gmail.com",
};
export const sites = {
  "raphaelrocha.com": "Principal",
  "portfolio.raphaelrocha.com": "Portfólio",
  "3d.raphaelrocha.com": "Geometry",
  "trivia.raphaelrocha.com": "Trivia",
  "mimica.raphaelrocha.com": "Mímica",
  "snake.raphaelrocha.com": "Snake",
  "flybrain.raphaelrocha.com": "Fly Brain Bench",
  "basilica.raphaelrocha.com": "Basílica de Nazaré",
  "cantinho.raphaelrocha.com": "Lotcraft — histórico Cantinho",
  "lotcraft.app": "Lotcraft",
  "rockitsolutions.com.br": "Rockit Solutions",
};

// Production and development streams share a Lotcraft property; the hostname allowlist below excludes DEV.
export const lotcraftPropertyId = "557114748";
export const rockitPropertyId = "560170762";
export function analyticsSource(host = "") {
  if (host && !Object.hasOwn(sites, host)) throw new Error("Projeto inválido.");
  if (host === "rockitsolutions.com.br")
    return {
      propertyId: rockitPropertyId,
      label: "Rockit Solutions · produção",
      hosts: ["rockitsolutions.com.br", "www.rockitsolutions.com.br"],
      url: "https://rockitsolutions.com.br",
      historical: false,
    };
  const lotcraft = host === "lotcraft.app";
  const historical = host === "cantinho.raphaelrocha.com";
  return {
    propertyId: lotcraft ? lotcraftPropertyId : config.propertyId,
    label: lotcraft
      ? "Lotcraft · produção"
      : historical
        ? "Histórico Cantinho · propriedade principal"
        : "Propriedade principal · Raphael Rocha",
    hosts: lotcraft
      ? [
          "lotcraft.app",
          "www.lotcraft.app",
          "cantinho.raphaelrocha.com",
          "www.cantinho.raphaelrocha.com",
        ]
      : historical
        ? [host, "www.cantinho.raphaelrocha.com"]
        : host
          ? [host]
          : Object.keys(sites).filter(
              (key) =>
                !["lotcraft.app", "rockitsolutions.com.br"].includes(key),
            ),
    url: host
      ? `https://${lotcraft || historical ? "lotcraft.app" : host}`
      : "https://raphaelrocha.com",
    historical,
  };
}
