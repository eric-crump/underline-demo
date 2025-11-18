"use client";
import { useState, useEffect } from "react";
import { ContentstackClient } from "@/lib/contentstack-client";

/**
 * Footer Component
 * Site footer with links, copyright, and branding
 */
export default function Footer({ locale }) {
  const [footerData, setFooterData] = useState(null);

  useEffect(() => {
    const fetchFooter = async () => {
      // Fetch the footer content type - don't pass initialData to avoid using homepage data
      const data = await ContentstackClient.getElementByType("footer", locale, null);
      if (data) {
        setFooterData(data[0]);
        console.log("footer", data[0]);
      } else {
        setFooterData(null);
      }
    };

    ContentstackClient.onEntryChange(fetchFooter);
  }, [locale]);

  // Don't render if no footer data
  if (!footerData) {
    return null;
  }

  // Helper function to get link URL from page reference
  const getLinkUrl = (page) => {
    if (!page || page.length === 0) {
      return "#";
    }
    // If page has a uid, construct URL (adjust based on your routing structure)
    const pageUid = page[0]?.uid;
    return pageUid ? `/${locale}/${pageUid}` : "#";
  };

  return (
    <div className="mt-16">
      {/* Wave Border - Outside footer so transparent area shows page content */}
      {footerData.border && footerData.border.svg && (
        <div
          className="w-full"
          dangerouslySetInnerHTML={{ __html: footerData.border.svg }}
        />
      )}
      <footer className="text-gray-300" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Branding Section */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-white text-xl font-bold mb-4">
                {footerData.logo_text || "Underline"}
              </h3>
              {footerData.details && (
                <p className="text-gray-400 text-sm mb-4">
                  {footerData.details}
                </p>
              )}
              {footerData.copyright && (
                <p className="text-gray-500 text-xs">
                  {footerData.copyright}
                </p>
              )}
            </div>

            {/* Link Columns */}
            {footerData.link_columns && footerData.link_columns.map((column, index) => (
              <div key={column._metadata?.uid || index}>
                <h4 className="text-white font-semibold mb-4">
                  {column.heading}
                </h4>
                <ul className="space-y-2 text-sm">
                  {column.items && column.items.map((item, itemIndex) => (
                    <li key={item._metadata?.uid || itemIndex}>
                      <a
                        href={getLinkUrl(item.page)}
                        className="hover:text-white transition-colors"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          {footerData.legal && (
            <div className="border-t border-gray-800 mt-8 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                {footerData.legal.info_text && (
                  <p>
                    {footerData.legal.info_text}
                  </p>
                )}
                {footerData.legal.links && footerData.legal.links.length > 0 && (
                  <div className="flex gap-6">
                    {footerData.legal.links.map((link, index) => (
                      <a
                        key={link._metadata?.uid || index}
                        href={getLinkUrl(link.page)}
                        className="hover:text-white transition-colors"
                      >
                        {link.text}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

