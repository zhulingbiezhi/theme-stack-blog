<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html>
      <head>
        <title>XML Sitemap</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
            border-bottom: 2px solid #4285f4;
            padding-bottom: 10px;
          }
          .info {
            background: #e8f0fe;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: #4285f4;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
          }
          tr:hover {
            background: #f5f5f5;
          }
          a {
            color: #4285f4;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .count {
            font-weight: bold;
            color: #4285f4;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🗺️ XML Sitemap</h1>
          <div class="info">
            <p>这是一个 XML Sitemap，用于帮助搜索引擎更好地索引网站内容。</p>
            <p>共包含 <span class="count"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span> 个 URL</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 50%">URL</th>
                <th style="width: 20%">最后修改</th>
                <th style="width: 15%">更新频率</th>
                <th style="width: 15%">优先级</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a>
                      <xsl:attribute name="href">
                        <xsl:value-of select="sitemap:loc"/>
                      </xsl:attribute>
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:lastmod"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                  <td>
                    <xsl:value-of select="sitemap:priority"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
  
</xsl:stylesheet>
