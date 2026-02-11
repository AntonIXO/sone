import { ChevronLeft, ChevronRight, Search, X, Loader2 } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useAudioContext } from "../contexts/AudioContext";
import { getTidalImageUrl, type SearchResults } from "../hooks/useAudio";
import TidalImage from "./TidalImage";
import UserMenu from "./UserMenu";

export default function Header() {
  const {
    playTrack,
    setQueueTracks,
    navigateToAlbum,
    navigateToSearch,
    searchTidal,
    currentView,
    navigateHome,
  } = useAudioContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickResults, setQuickResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Sync search query with current view if it's a search view
  useEffect(() => {
    if (currentView.type === "search") {
      setSearchQuery(currentView.query);
    }
  }, [currentView]);

  // Debounced quick search
  const doQuickSearch = useCallback(
    (query: string) => {
      clearTimeout(debounceRef.current);
      if (!query.trim()) {
        setQuickResults(null);
        setSearching(false);
        return;
      }
      setSearching(true);
      debounceRef.current = setTimeout(() => {
        searchTidal(query.trim(), 5)
          .then((results) => {
            setQuickResults(results);
          })
          .catch(() => {
            setQuickResults(null);
          })
          .finally(() => {
            setSearching(false);
          });
      }, 300);
    },
    [searchTidal]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchOpen(true);
    doQuickSearch(val);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setSearchOpen(false);
      navigateToSearch(searchQuery.trim());
    } else if (e.key === "Escape") {
      setSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchOpen(false);
    setQuickResults(null);
    searchInputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasResults =
    quickResults &&
    (quickResults.tracks.length > 0 ||
      quickResults.albums.length > 0 ||
      quickResults.artists.length > 0);

  const getHeaderTitle = () => {
    if (currentView.type === "search") {
      return `Results for "${currentView.query}"`;
    }
    return "";
  };

  return (
    <div className="h-16 flex items-center justify-between px-6 bg-[#121212] z-30 shrink-0 sticky top-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.history.back()} 
            className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-[#a6a6a6] hover:text-white transition-colors disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <button
             onClick={() => window.history.forward()}
             className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-[#a6a6a6] hover:text-white transition-colors disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dynamic Title */}
        <h1 className="text-[18px] font-bold text-white truncate ml-2">
          {getHeaderTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative max-w-[360px] w-64 lg:w-80">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#242424] hover:bg-[#2a2a2a] focus-within:bg-[#2a2a2a] rounded-full transition-colors group border border-transparent focus-within:border-white/10">
            <Search
              size={18}
              className="text-[#b3b3b3] group-focus-within:text-white shrink-0"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                if (searchQuery.trim()) setSearchOpen(true);
              }}
              placeholder="Search"
              className="bg-transparent text-sm text-white placeholder-[#808080] outline-none flex-1 min-w-0"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="text-[#808080] hover:text-white shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {searchOpen && searchQuery.trim() && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-full mt-2 w-[360px] bg-[#1a1a1a] rounded-lg shadow-2xl shadow-black/60 border border-white/8 z-50 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent"
            >
              {searching && !hasResults && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={18} className="animate-spin text-[#00FFFF]" />
                </div>
              )}

              {!searching && !hasResults && quickResults && (
                <div className="py-6 text-center text-[13px] text-[#666]">
                  No results found
                </div>
              )}

              {hasResults && (
                <div className="py-1">
                  {/* Tracks */}
                  {quickResults!.tracks.map((track) => (
                    <button
                      key={`t-${track.id}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setQueueTracks([]);
                        playTrack(track);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/6 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded bg-[#282828] overflow-hidden shrink-0">
                        <TidalImage
                          src={getTidalImageUrl(track.album?.cover, 80)}
                          alt={track.title}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white truncate">
                          {track.title}
                        </p>
                        <p className="text-[11px] text-[#808080] truncate">
                          Track &middot;{" "}
                          {track.artist?.name || "Unknown Artist"}
                        </p>
                      </div>
                    </button>
                  ))}

                  {/* Albums */}
                  {quickResults!.albums.map((album) => (
                    <button
                      key={`a-${album.id}`}
                      onClick={() => {
                        setSearchOpen(false);
                        navigateToAlbum(album.id, {
                          title: album.title,
                          cover: album.cover,
                          artistName: album.artist?.name,
                        });
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/6 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded bg-[#282828] overflow-hidden shrink-0">
                        <TidalImage
                          src={getTidalImageUrl(album.cover, 80)}
                          alt={album.title}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white truncate">
                          {album.title}
                        </p>
                        <p className="text-[11px] text-[#808080] truncate">
                          Album &middot; {album.artist?.name || "Unknown"}
                        </p>
                      </div>
                    </button>
                  ))}

                  {/* Artists */}
                  {quickResults!.artists.map((artist) => (
                    <div
                      key={`ar-${artist.id}`}
                      className="flex items-center gap-3 px-3 py-2 text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#282828] overflow-hidden shrink-0 flex items-center justify-center">
                        <span className="text-[12px] font-bold text-[#666]">
                          {artist.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white truncate">
                          {artist.name}
                        </p>
                        <p className="text-[11px] text-[#808080]">Artist</p>
                      </div>
                    </div>
                  ))}

                  {/* View all */}
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      navigateToSearch(searchQuery.trim());
                    }}
                    className="w-full py-2.5 text-center text-[12px] font-semibold text-[#00FFFF] hover:bg-white/4 border-t border-white/6 transition-colors"
                  >
                    View all results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <UserMenu />
      </div>
    </div>
  );
}
