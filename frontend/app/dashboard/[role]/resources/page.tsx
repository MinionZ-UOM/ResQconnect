"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Search, Edit, Trash, MapPin } from "lucide-react";
import type { Resource, ResourceType, ResourceStatus } from "@/lib/types";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, doc, getDoc, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ResourceType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | "All">("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [userResources, setUserResources] = useState<Resource[]>([]);
  const [resourceType, setResourceType] = useState("");
  const [resourceQuantity, setResourceQuantity] = useState(1);
  const [resourceLocationLat, setResourceLocationLat] = useState("");
  const [resourceLocationLng, setResourceLocationLng] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUid, setCurrentUid] = useState("");

  const fetchResources = async (uid: string) => {
    const q = query(collection(db, "resources"), where("uid", "==", uid));
    const snapshot = await getDocs(q);
    const data: Resource[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.category,
        type: d.category,
        status: d.status === "not_available" ? "Not_Available" : "Available",
        quantity: d.quantity_available,
        location: {
          latitude: d.location_lat,
          longitude: d.location_lng,
          address: `Lat: ${d.location_lat}, Lng: ${d.location_lng}`,
        },
        createdAt: d.created_at ? new Date(d.created_at) : new Date(),
        updatedAt: d.updated_at ? new Date(d.updated_at) : new Date(),
      };
    });
    setUserResources(data);
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUid(user.uid);
        await fetchResources(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

const handleAddResource = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const userDocRef = doc(db, "users", currentUid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      throw new Error("User profile not found in Firestore");
    }

    const userData = userSnap.data();
    const role_id = userData.role_id;

    if (!role_id) {
      throw new Error("role_id missing in user profile");
    }

    await addDoc(collection(db, "resources"), {
      category: resourceType,
      quantity_total: resourceQuantity,
      quantity_available: resourceQuantity,
      location_lat: parseFloat(resourceLocationLat),
      location_lng: parseFloat(resourceLocationLng),
      status: "available",
      uid: currentUid,
      role_id, 
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });

    await fetchResources(currentUid);
    setResourceType("");
    setResourceQuantity(1);
    setResourceLocationLat("");
    setResourceLocationLng("");
    setIsAddDialogOpen(false);
    alert("Resource added successfully!");
  } catch (error) {
    console.error("Error adding resource:", error);
    alert(error.message || "Error adding resource. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};


const handleDeleteResource = async (resourceId: string) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this resource?");
  if (!confirmDelete) return;

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const token = await user.getIdToken(); // 🔐 Get Firebase ID token

    const res = await fetch(`/api/resources/${resourceId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // ✅ Pass token in Authorization header
      },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || "Failed to delete resource");
    }

    alert("Resource deleted successfully!");
    await fetchResources(currentUid); 
  } catch (err: any) {
    console.error("Error deleting resource:", err);
    alert(err.message || "An error occurred while deleting the resource");
  }
};

const handleUpdateStatus = async (resourceId: string, currentStatus: ResourceStatus) => {
  const nextStatus: ResourceStatus = currentStatus === "Available" ? "Not_Available" : "Available";

  const confirmUpdate = window.confirm(`Change status to ${nextStatus}?`);
  if (!confirmUpdate) return;

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const token = await user.getIdToken(); 

    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) throw new Error("User data not found in Firestore");

    const userData = userSnap.data();
    const role_id = userData.role_id;
    if (!role_id) throw new Error("role_id missing for user");

    const res = await fetch(`/api/resources/${resourceId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: nextStatus.toLowerCase(), // "available" or "not_available"
        role_id, 
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || "Failed to update status");
    }

    alert(`Resource status updated to ${nextStatus}`);
    await fetchResources(currentUid);
  } catch (err: any) {
    console.error("Error updating resource status:", err);
    alert(err.message || "An error occurred while updating status");
  }
};


  const filteredResources = userResources.filter((r) => {
    const matchesSearch = searchQuery === "" || r.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || r.type === typeFilter;
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: ResourceStatus) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "Not_Available":
        return <Badge className="bg-red-500">Not Available</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
            Resource Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and track your resources
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription>Fill in the resource details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <Label htmlFor="type">Resource Type</Label>
                <Select value={resourceType} onValueChange={(val) => setResourceType(val)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="shelter">Shelter</SelectItem>
                    <SelectItem value="rescue_equipment">Rescue Equipment</SelectItem>
                    <SelectItem value="communication_device">Communication Device</SelectItem>
                    <SelectItem value="power_supply">Power Supply</SelectItem>
                    <SelectItem value="sanitation_kit">Sanitation Kit</SelectItem>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="medical_kit">Medical Kit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={resourceQuantity}
                  onChange={(e) => setResourceQuantity(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  value={resourceLocationLat}
                  onChange={(e) => setResourceLocationLat(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  value={resourceLocationLng}
                  onChange={(e) => setResourceLocationLng(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Resource"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resource Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type-filter">Resource Type</Label>
              <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as ResourceType | "All")}>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="medicine">Medicine</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="shelter">Shelter</SelectItem>
                  <SelectItem value="rescue_equipment">Rescue Equipment</SelectItem>
                  <SelectItem value="communication_device">Communication Device</SelectItem>
                  <SelectItem value="power_supply">Power Supply</SelectItem>
                  <SelectItem value="sanitation_kit">Sanitation Kit</SelectItem>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="medical_kit">Medical Kit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as ResourceStatus | "All")}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Not_Available">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search resources..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>{filteredResources.length} resources found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell><Badge variant="outline">{r.type}</Badge></TableCell>
                    <TableCell>{r.quantity}</TableCell>
                    <TableCell>{getStatusBadge(r.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{r.location?.address || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateStatus(r.id, r.status)}
                              >
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Change Availability Status</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteResource(r.id)}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Resource</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredResources.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-slate-500">
                      No resources found matching the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
